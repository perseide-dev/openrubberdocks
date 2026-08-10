import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JsonApiQueryOptions {
    relations?: string[];
}

export const JsonApiQuery = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JsonApiQueryOptions => {
        const request = ctx.switchToHttp().getRequest();
        const includeParam = request.query.include as string;

        let relations: string[] = [];

        if (includeParam) {
            // Separa por comas: "articles,articles.category" -> ['articles', 'articles.category']
            relations = includeParam.split(',').map(rel => rel.trim());
        }

        return { relations };
    },
);