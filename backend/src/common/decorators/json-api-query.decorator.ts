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
            Object.entries(query.filter).forEach(([fieldsString, operatorObj]) => {
                const fields = fieldsString.split(',').map(f => f.trim());

                Object.entries(operatorObj as Record<string, string>).forEach(([operator, value]) => {
                    filters.push({
                        fields,
                        operator: operator as FilterOperator,
                        value,
                    });
                });
            });
        }

        return { relations, filters };
    },
);