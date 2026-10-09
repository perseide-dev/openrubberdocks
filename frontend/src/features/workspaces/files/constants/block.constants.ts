import type {
    BlockFilters,
    BlockType,
} from '@features/workspaces/files/types/block.types';

export const BLOCK_ENDPOINTS = {
    BASE: 'blocks',
    BY_UUID: (uuid: string) => `blocks/${uuid}`,
    MOVE: (uuid: string) => `blocks/${uuid}/move`,
} as const;

export const BLOCK_RESOURCE_TYPE = 'blocks';

export const BLOCK_QUERY_KEYS = {
    ALL: ['blocks'] as const,
    LIST: (filters?: BlockFilters) => ['blocks', 'list', filters] as const,
    DETAIL: (uuid: string) => ['blocks', 'detail', uuid] as const,
} as const;

export const BLOCK_MUTATION_KEYS = {
    CREATE: ['blocks', 'create'] as const,
    UPDATE: ['blocks', 'update'] as const,
    MOVE: ['blocks', 'move'] as const,
    DELETE: ['blocks', 'delete'] as const,
} as const;

export const BLOCK_DEFAULTS = {
    STALE_TIME: 5 * 60 * 1000,
} as const;

export const BLOCK_TYPES: readonly BlockType[] = [
    'text',
    'heading_1',
    'heading_2',
    'heading_3',
    'bullet_list',
    'numbered_list',
    'todo',
    'image',
    'code',
    'quote',
    'divider',
] as const;
