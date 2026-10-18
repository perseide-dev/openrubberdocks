export const files = {
    create: {
        route: '/workspaces/:uuid/files/new',
        build: (uuid: string) => `/workspaces/${uuid}/files/new`,
        label: '// NEW FILE',
    },
    view: {
        route: '/workspaces/:workspaceUuid/files/:fileUuid',
        build: (workspaceUuid: string, fileUuid: string) => `/workspaces/${workspaceUuid}/files/${fileUuid}`,
    },
    edit: {
        route: '/workspaces/:workspaceUuid/files/:fileUuid/edit',
        build: (workspaceUuid: string, fileUuid: string) => `/workspaces/${workspaceUuid}/files/${fileUuid}/edit`,
    },
} as const;
