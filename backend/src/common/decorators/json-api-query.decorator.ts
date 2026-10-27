import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JsonApiFilter, FilterOperator } from '@commonInterface/json-api-filter.interface';

export interface JsonApiQueryOptions {
    relations?: string[];
    filters?: JsonApiFilter[];
}

export const JsonApiQuery = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JsonApiQueryOptions => {
        const request = ctx.switchToHttp().getRequest();
        const query = request.query;

        // Parseo de relaciones (Include)
        const relations = query.include
            ? (query.include as string).split(',').map(rel => rel.trim())
            : [];

        // Parseo de filtros
        const filters: JsonApiFilter[] = [];
        if (query.filter && typeof query.filter === 'object') {
            // query.filter llega como: { 'firstName,lastName': { 'orLike': 'John' }, 'age': { 'gt': '18' } }
            // o con valor directo: { 'fileUuid': '123' }
            Object.entries(query.filter).forEach(([fieldsString, operatorObj]) => {
                const fields = fieldsString.split(',').map(f => f.trim());

                if (operatorObj && typeof operatorObj === 'object') {
                    Object.entries(operatorObj as Record<string, string>).forEach(([operator, value]) => {
                        filters.push({
                            fields,
                            operator: operator as FilterOperator,
                            value,
                        });
                    });
                } else if (typeof operatorObj === 'string') {
                    filters.push({
                        fields,
                        operator: 'eq',
                        value: operatorObj,
                    });
                }
            });
        }

        // Parseo de query params directos (e.g. ?fileUuid=xxx o ?workspaceUuid=xxx)
        const RESERVED_QUERY_KEYS = new Set(['include', 'filter', 'sort', 'page']);
        Object.entries(query).forEach(([key, val]) => {
            if (!RESERVED_QUERY_KEYS.has(key) && typeof val === 'string') {
                filters.push({
                    fields: [key],
                    operator: 'eq',
                    value: val,
                });
            }
        });

        return { relations, filters };
    },
);