export const STORAGE_ENDPOINTS = {
    UPLOAD: 'storage/upload',
    QUOTA: (workspaceUuid: string) => `storage/quota/${workspaceUuid}`,
    WORKSPACE_LIST: (workspaceUuid: string) => `storage/workspace/${workspaceUuid}`,
    ATTACHMENT_CONTENT: (uuid: string) => `storage/attachments/${uuid}/content`,
    DELETE: (uuid: string) => `storage/attachments/${uuid}`,
    WORKSPACE_TASKS: (workspaceUuid: string) => `workspaces/${workspaceUuid}/tasks`,
} as const;

export const STORAGE_QUERY_KEYS = {
    ALL: ['storage'] as const,
    QUOTA: (workspaceUuid: string) => ['storage', 'quota', workspaceUuid] as const,
    LIST: (workspaceUuid: string) => ['storage', 'list', workspaceUuid] as const,
    WORKSPACE_TASKS: (workspaceUuid: string) => ['storage', 'workspace-tasks', workspaceUuid] as const,
} as const;

export const STORAGE_MUTATION_KEYS = {
    UPLOAD: ['storage', 'upload'] as const,
    DELETE: ['storage', 'delete'] as const,
} as const;

export const STORAGE_DEFAULTS = {
    STALE_TIME: 60 * 1000,
} as const;
