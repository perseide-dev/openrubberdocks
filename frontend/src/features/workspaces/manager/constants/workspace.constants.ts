import type {
    WorkspaceFilters,
    WorkspaceFormState,
} from '@features/workspaces/manager/types/workspace.types';

export const WORKSPACE_ENDPOINTS = {
    BASE: 'workspaces',
    BY_UUID: (uuid: string) => `workspaces/${uuid}`,
} as const;

export const WORKSPACE_RESOURCE_TYPE = 'workspaces';

export const WORKSPACE_QUERY_KEYS = {
    ALL: ['workspaces'] as const,
    LIST: (filters?: WorkspaceFilters) => ['workspaces', 'list', filters] as const,
    DETAIL: (uuid: string) => ['workspaces', 'detail', uuid] as const,
} as const;

export const WORKSPACE_MUTATION_KEYS = {
    CREATE: ['workspaces', 'create'] as const,
    UPDATE: ['workspaces', 'update'] as const,
    DELETE: ['workspaces', 'delete'] as const,
} as const;

export const WORKSPACE_DEFAULTS = {
    STALE_TIME: 5 * 60 * 1000,
} as const;

export const WORKSPACE_FORM_INITIAL_STATE: WorkspaceFormState = {
    name: '',
    description: '',
};

export const WORKSPACE_MESSAGES = {
    NAME_REQUIRED: 'Workspace name is required.',
    CREATE_ERROR: 'Unable to create workspace. Please try again.',
} as const;
