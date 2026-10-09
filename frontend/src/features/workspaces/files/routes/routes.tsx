export const files = {
    create: {
        route: '/workspaces/:uuid/files/new',
        build: (uuid: string) => `/workspaces/${uuid}/files/new`,
        label: '// NEW FILE',
    },
} as const;
