export const REVISION_RESOURCE_TYPE = 'file_revisions';

export const REVISION_ENDPOINTS = {
    BASE: (fileUuid: string) => `files/${fileUuid}/revisions`,
    BY_UUID: (fileUuid: string, revisionUuid: string) => `files/${fileUuid}/revisions/${revisionUuid}`,
    RESTORE: (fileUuid: string, revisionUuid: string) => `files/${fileUuid}/revisions/${revisionUuid}/restore`,
} as const;

export const REVISION_QUERY_KEYS = {
    ALL: ['file-revisions'] as const,
    LIST: (fileUuid: string) => ['file-revisions', 'list', fileUuid] as const,
    DETAIL: (fileUuid: string, revisionUuid: string) => ['file-revisions', 'detail', fileUuid, revisionUuid] as const,
} as const;

export const REVISION_DEFAULTS = {
    STALE_TIME: 60 * 1000,
} as const;

export const REVISION_LABELS = {
    DRAWER_TITLE: '// REVISION_HISTORY',
    DRAWER_SUBTITLE: '// AUDIT_LOG & VERSION_CHECKPOINTS',
    BUTTON_HISTORY: '// HISTORY',
    NO_REVISIONS: '// NO_REVISIONS_RECORDED',
    LOADING: '// LOADING_REVISIONS...',
    RESTORE_BUTTON: 'RESTORE VERSION',
    CURRENT_VERSION: '// CURRENT_CHECKPOINT',
    CONFIRM_TITLE: 'RESTORE VERSION CHECKPOINT',
    CONFIRM_DESCRIPTION: 'Are you sure you want to restore the document to this version? Current content will be archived into a new audit checkpoint automatically.',
    TOOLTIP_MUTATION_LOCKED: '// ACCESS: READ ONLY - RESTORE LOCKED',
    SYSTEM_AUTHOR: 'System',
    BLOCK_COUNT: (count: number) => `${count} block${count === 1 ? '' : 's'}`,
} as const;
