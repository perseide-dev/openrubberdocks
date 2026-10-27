import { SelectQueryBuilder, Brackets, ObjectLiteral } from 'typeorm';
import { JsonApiFilter } from '@commonInterface/json-api-filter.interface';

const SAFE_FIELD_REGEX = /^[a-zA-Z0-9_]+$/;
const SUPPORTED_OPERATORS = new Set([
  'eq',
  'like',
  'gt',
  'lt',
  'gte',
  'lte',
  'orLike',
  'orEq',
  'splitLike',
  'splitEq',
]);

export function applyJsonApiFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  filters: JsonApiFilter[],
  entityAlias: string,
): SelectQueryBuilder<T> {
  let pIndex = 0;

  filters.forEach((filter) => {
    const { operator, value } = filter;
    if (!SUPPORTED_OPERATORS.has(operator)) {
      return;
    }

    const rawFields = Array.isArray(filter.fields)
      ? filter.fields
      : (filter as any).field
        ? [(filter as any).field]
        : [];
    const validFields = rawFields.filter(
      (f: unknown): f is string => typeof f === 'string' && SAFE_FIELD_REGEX.test(f),
    );

    if (validFields.length === 0) {
      return;
    }

    if (['splitLike', 'splitEq'].includes(operator)) {
      const values = String(value ?? '').split('|');
      const hasAnyCondition = validFields.some((_, idx) => Boolean(values[idx]));
      if (!hasAnyCondition) {
        return;
      }
    }

    qb.andWhere(
      new Brackets((qbWrap) => {
        // Operadores de columna única o comparaciones matemáticas
        if (['eq', 'like', 'gt', 'lt', 'gte', 'lte'].includes(operator)) {
          const field = `${entityAlias}.${validFields[0]}`;
          const param = `val_${pIndex++}`;

          switch (operator) {
            case 'eq':
              qbWrap.where(`${field} = :${param}`, { [param]: value });
              break;
            case 'like':
              qbWrap.where(`${field} ILIKE :${param}`, { [param]: `%${value}%` });
              break;
            case 'gt':
              qbWrap.where(`${field} > :${param}`, { [param]: value });
              break;
            case 'lt':
              qbWrap.where(`${field} < :${param}`, { [param]: value });
              break;
            case 'gte':
              qbWrap.where(`${field} >= :${param}`, { [param]: value });
              break;
            case 'lte':
              qbWrap.where(`${field} <= :${param}`, { [param]: value });
              break;
          }
        }

        // Operadores Conjuntos
        else if (['orLike', 'orEq'].includes(operator)) {
          const param = `val_${pIndex++}`;
          const exact = operator === 'orEq';
          const queryValue = exact ? value : `%${value}%`;
          const sqlOperator = exact ? '=' : 'ILIKE';

          validFields.forEach((field, index) => {
            const column = `${entityAlias}.${field}`;
            if (index === 0) {
              qbWrap.where(`${column} ${sqlOperator} :${param}`, { [param]: queryValue });
            } else {
              qbWrap.orWhere(`${column} ${sqlOperator} :${param}`, { [param]: queryValue });
            }
          });
        }

        // Operadores de Separación
        else if (['splitLike', 'splitEq'].includes(operator)) {
          const values = String(value ?? '').split('|');
          const exact = operator === 'splitEq';
          const sqlOperator = exact ? '=' : 'ILIKE';
          let added = false;

          validFields.forEach((field, index) => {
            if (!values[index]) return;

            const column = `${entityAlias}.${field}`;
            const param = `val_${pIndex++}`;
            const queryValue = exact ? values[index] : `%${values[index]}%`;

            if (!added) {
              qbWrap.where(`${column} ${sqlOperator} :${param}`, { [param]: queryValue });
              added = true;
            } else {
              qbWrap.andWhere(`${column} ${sqlOperator} :${param}`, { [param]: queryValue });
            }
          });
        }
      }),
    );
  });

  return qb;
}