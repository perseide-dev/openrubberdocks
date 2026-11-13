import { parse as parseYaml } from 'yaml';
import type {
    ParsedOpenApiEndpoint,
    ParsedOpenApiParameter,
    ParsedOpenApiResponse,
    ParsedOpenApiSpec,
} from '@features-workspaces/files/types/block.types';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;

function formatSchemaPreview(schema: unknown): string | undefined {
    if (!schema || typeof schema !== 'object') return undefined;
    try {
        return JSON.stringify(schema, null, 2);
    } catch {
        return undefined;
    }
}

export function parseOpenApiSpec(rawContent: string): {
    spec: ParsedOpenApiSpec | null;
    error: string | null;
} {
    const trimmed = rawContent.trim();
    if (!trimmed) {
        return { spec: null, error: null };
    }

    try {
        const doc = parseYaml(trimmed) as Record<string, unknown> | null;
        if (!doc || typeof doc !== 'object') {
            return { spec: null, error: 'Document root must be a valid JSON or YAML object.' };
        }

        const info = (doc.info && typeof doc.info === 'object' ? doc.info : {}) as Record<
            string,
            unknown
        >;
        const title = typeof info.title === 'string' ? info.title : 'OpenAPI / JSON:API Contract';
        const version = typeof info.version === 'string' ? info.version : '1.0.0';
        const description = typeof info.description === 'string' ? info.description : '';

        const serversRaw = Array.isArray(doc.servers) ? doc.servers : [];
        const servers = serversRaw
            .map((s) =>
                s && typeof s === 'object' && typeof (s as Record<string, unknown>).url === 'string'
                    ? String((s as Record<string, unknown>).url)
                    : '',
            )
            .filter(Boolean);

        const pathsObj = (
            doc.paths && typeof doc.paths === 'object' ? doc.paths : {}
        ) as Record<string, unknown>;

        const endpoints: ParsedOpenApiEndpoint[] = [];

        for (const [pathKey, pathItem] of Object.entries(pathsObj)) {
            if (!pathItem || typeof pathItem !== 'object') continue;
            const pathRecord = pathItem as Record<string, unknown>;

            for (const method of HTTP_METHODS) {
                const operation = pathRecord[method];
                if (!operation || typeof operation !== 'object') continue;
                const opRecord = operation as Record<string, unknown>;

                const paramsRaw = Array.isArray(opRecord.parameters)
                    ? opRecord.parameters
                    : Array.isArray(pathRecord.parameters)
                    ? pathRecord.parameters
                    : [];

                const parameters: ParsedOpenApiParameter[] = paramsRaw
                    .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === 'object'))
                    .map((p) => {
                        const schemaObj =
                            p.schema && typeof p.schema === 'object'
                                ? (p.schema as Record<string, unknown>)
                                : {};
                        return {
                            name: typeof p.name === 'string' ? p.name : 'param',
                            in: typeof p.in === 'string' ? p.in : 'query',
                            required: Boolean(p.required),
                            type:
                                typeof schemaObj.type === 'string'
                                    ? schemaObj.type
                                    : typeof p.type === 'string'
                                    ? p.type
                                    : 'string',
                            description: typeof p.description === 'string' ? p.description : '',
                        };
                    });

                let requestBodyPreview: string | undefined;
                if (opRecord.requestBody && typeof opRecord.requestBody === 'object') {
                    const rb = opRecord.requestBody as Record<string, unknown>;
                    const content =
                        rb.content && typeof rb.content === 'object'
                            ? (rb.content as Record<string, unknown>)
                            : {};
                    const firstMedia = Object.values(content)[0] as
                        | Record<string, unknown>
                        | undefined;
                    requestBodyPreview = formatSchemaPreview(firstMedia?.schema ?? rb);
                }

                const responsesObj = (
                    opRecord.responses && typeof opRecord.responses === 'object'
                        ? opRecord.responses
                        : {}
                ) as Record<string, unknown>;

                const responses: ParsedOpenApiResponse[] = Object.entries(responsesObj).map(
                    ([statusCode, respVal]) => {
                        const respRecord =
                            respVal && typeof respVal === 'object'
                                ? (respVal as Record<string, unknown>)
                                : {};
                        const contentObj =
                            respRecord.content && typeof respRecord.content === 'object'
                                ? (respRecord.content as Record<string, unknown>)
                                : {};
                        const firstMediaKey = Object.keys(contentObj)[0];
                        const firstMediaVal = firstMediaKey
                            ? (contentObj[firstMediaKey] as Record<string, unknown>)
                            : undefined;

                        return {
                            statusCode,
                            description:
                                typeof respRecord.description === 'string'
                                    ? respRecord.description
                                    : '',
                            contentType: firstMediaKey,
                            schemaPreview: formatSchemaPreview(firstMediaVal?.schema),
                        };
                    },
                );

                const tags = Array.isArray(opRecord.tags)
                    ? opRecord.tags.map((t) => String(t))
                    : [];

                endpoints.push({
                    id: `${method.toUpperCase()}_${pathKey}`,
                    method: method.toUpperCase(),
                    path: pathKey,
                    summary: typeof opRecord.summary === 'string' ? opRecord.summary : '',
                    description:
                        typeof opRecord.description === 'string' ? opRecord.description : '',
                    tags,
                    parameters,
                    requestBodyPreview,
                    responses,
                });
            }
        }

        return {
            spec: {
                title,
                version,
                description,
                servers,
                endpoints,
            },
            error: null,
        };
    } catch (err) {
        return {
            spec: null,
            error: err instanceof Error ? err.message : 'Invalid YAML/JSON OpenAPI specification.',
        };
    }
}
