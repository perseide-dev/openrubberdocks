import { SelectQueryBuilder, Brackets, ObjectLiteral } from 'typeorm'; // <-- Importa ObjectLiteral
import { JsonApiFilter } from '@commonInterface/json-api-filter.interface';

// Añade la restricción "extends ObjectLiteral" a la T
export function applyJsonApiFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  filters: JsonApiFilter[],
  entityAlias: string
): SelectQueryBuilder<T> {

  let pIndex = 0;

  filters.forEach(({ fields, operator, value }) => {
    qb.andWhere(new Brackets(qbWrap => {

      // Operadores de columna única o comparaciones matemáticas
      if (['eq', 'like', 'gt', 'lt', 'gte', 'lte'].includes(operator)) {
        const field = `${entityAlias}.${fields[0]}`;
        const param = `val_${pIndex++}`;

        switch (operator) {
          case 'eq': qbWrap.where(`${field} = :${param}`, { [param]: value }); break;
          case 'like': qbWrap.where(`${field} ILIKE :${param}`, { [param]: `%${value}%` }); break;
          case 'gt': qbWrap.where(`${field} > :${param}`, { [param]: value }); break;
          case 'lt': qbWrap.where(`${field} < :${param}`, { [param]: value }); break;
          case 'gte': qbWrap.where(`${field} >= :${param}`, { [param]: value }); break;
          case 'lte': qbWrap.where(`${field} <= :${param}`, { [param]: value }); break;
        }
      }

      // Operadores Conjuntos
      else if (['orLike', 'orEq'].includes(operator)) {
        const param = `val_${pIndex++}`;
        const exact = operator === 'orEq';
        const queryValue = exact ? value : `%${value}%`;
        const sqlOperator = exact ? '=' : 'ILIKE';

        fields.forEach((field, index) => {
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
        const values = value.split('|');
        const exact = operator === 'splitEq';
        const sqlOperator = exact ? '=' : 'ILIKE';

        fields.forEach((field, index) => {
          if (!values[index]) return;

          const column = `${entityAlias}.${field}`;
          const param = `val_${pIndex++}`;
          const queryValue = exact ? values[index] : `%${values[index]}%`;

          if (index === 0) {
            qbWrap.where(`${column} ${sqlOperator} :${param}`, { [param]: queryValue });
          } else {
            qbWrap.andWhere(`${column} ${sqlOperator} :${param}`, { [param]: queryValue });
          }
        });
      }
    }));
  });

  return qb;
}