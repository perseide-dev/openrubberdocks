export const PROJECT_RESOURCE_TYPES = {
    PROJECTS: 'projects',
    TASKS: 'tasks',
    STATUSES: 'task_statuses',
    TYPES: 'task_types',
    PROPERTIES: 'task_properties',
    TIME_LOGS: 'task_time_logs',
    FILE_LINKS: 'project_file_links',
} as const;

export const PROJECT_ENDPOINTS = {
    BASE: 'projects',
    BY_UUID: (uuid: string) => `projects/${uuid}`,
    STATUSES: (projectUuid: string) => `projects/${projectUuid}/statuses`,
    STATUS_BY_UUID: (projectUuid: string, statusUuid: string) => `projects/${projectUuid}/statuses/${statusUuid}`,
    TYPES: (projectUuid: string) => `projects/${projectUuid}/types`,
    TYPE_BY_UUID: (projectUuid: string, typeUuid: string) => `projects/${projectUuid}/types/${typeUuid}`,
    PROPERTIES: (projectUuid: string) => `projects/${projectUuid}/properties`,
    PROPERTY_BY_UUID: (projectUuid: string, propUuid: string) => `projects/${projectUuid}/properties/${propUuid}`,
    FILES: (projectUuid: string) => `projects/${projectUuid}/files`,
    FILE_BY_UUID: (projectUuid: string, fileUuid: string) => `projects/${projectUuid}/files/${fileUuid}`,
    TASKS: (projectUuid: string) => `projects/${projectUuid}/tasks`,
    TASK_BY_UUID: (taskUuid: string) => `tasks/${taskUuid}`,
    MOVE_TASK: (taskUuid: string) => `tasks/${taskUuid}/move`,
    TIME_LOGS: (taskUuid: string) => `tasks/${taskUuid}/time-logs`,
    TIME_LOG_BY_UUID: (taskUuid: string, logUuid: string) => `tasks/${taskUuid}/time-logs/${logUuid}`,
} as const;

export const PROJECT_QUERY_KEYS = {
    ALL: ['projects'] as const,
    WORKSPACE: (workspaceUuid: string) => ['projects', 'workspace', workspaceUuid] as const,
    DETAIL: (projectUuid: string) => ['projects', 'detail', projectUuid] as const,
    STATUSES: (projectUuid: string) => ['projects', projectUuid, 'statuses'] as const,
    TYPES: (projectUuid: string) => ['projects', projectUuid, 'types'] as const,
    PROPERTIES: (projectUuid: string) => ['projects', projectUuid, 'properties'] as const,
    FILES: (projectUuid: string) => ['projects', projectUuid, 'files'] as const,
    TASKS: (projectUuid: string) => ['projects', projectUuid, 'tasks'] as const,
    TASK_DETAIL: (taskUuid: string) => ['tasks', 'detail', taskUuid] as const,
    TIME_LOGS: (taskUuid: string) => ['tasks', taskUuid, 'time-logs'] as const,
} as const;

export const PROJECT_DEFAULTS = {
    STALE_TIME: 60 * 1000,
} as const;

export const PROJECT_LABELS = {
    TAB_PROJECTS: '// PROJECTS',
    TAB_BOARD: '// BOARD',
    TAB_TIMELINE: '// TIMELINE',
    TAB_TASKS: '// TASKS',
    TAB_FILES: '// FILES',
    TAB_SETTINGS: '// SETTINGS',
    CREATE_PROJECT: 'CREATE PROJECT',
    NEW_PROJECT: '// NEW_PROJECT',
    ADD_TASK: '+ ADD TASK',
    NO_PROJECTS: '// NO_PROJECTS_FOUND',
    NO_TASKS: '// NO_TASKS_IN_STAGE',
    NO_FILES: '// NO_FILES_LINKED',
    LOADING: '// LOADING_DATA...',
    LOG_TIME: 'LOG TIME',
    RESTORE_LOCKED: '// ACCESS: READ ONLY - MUTATION LOCKED',
    EXTERNAL_OVERVIEW: '// PROJECT_METRICS',
    TOTAL_TASKS: '// TOTAL_TASKS',
    COMPLETED_TASKS: '// COMPLETED',
    IN_PROGRESS_TASKS: '// IN_PROGRESS',
    PENDING_TASKS: '// PENDING',
    PROGRESS: '// OVERALL_PROGRESS',
    LATEST_COMPLETED: '// LATEST_COMPLETED_TASKS',
    UPCOMING_DEADLINES: '// UPCOMING_DEADLINES',
    THIS_WEEK: 'THIS WEEK',
    THIS_MONTH: 'THIS MONTH',
    NO_COMPLETED_TASKS: '// NO_COMPLETED_TASKS_YET',
    NO_UPCOMING_TASKS: '// NO_UPCOMING_DEADLINES_IN_PERIOD',
} as const;

export const PROPERTY_TYPE_OPTIONS = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Select' },
    { value: 'multi_select', label: 'Multi-Select' },
    { value: 'date', label: 'Date' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'url', label: 'URL' },
    { value: 'user', label: 'User' },
] as const;
