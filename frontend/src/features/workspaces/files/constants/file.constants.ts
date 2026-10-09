import type { FileFilters } from '@features/workspaces/files/types/file.types';

export const FILE_ENDPOINTS = {
    BASE: 'pages',
    BY_UUID: (uuid: string) => `pages/${uuid}`,
} as const;

export const FILE_RESOURCE_TYPE = 'pages';

export const FILE_QUERY_KEYS = {
    ALL: ['files'] as const,
    LIST: (filters?: FileFilters) => ['files', 'list', filters] as const,
    DETAIL: (uuid: string) => ['files', 'detail', uuid] as const,
} as const;

export const FILE_MUTATION_KEYS = {
    CREATE: ['files', 'create'] as const,
    UPDATE: ['files', 'update'] as const,
    DELETE: ['files', 'delete'] as const,
} as const;

export const FILE_DEFAULTS = {
    STALE_TIME: 5 * 60 * 1000,
} as const;
