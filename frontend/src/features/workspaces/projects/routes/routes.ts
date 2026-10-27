export const projectsRoutes = {
    detail: {
        route: '/workspaces/:workspaceUuid/projects/:projectUuid',
        build: (workspaceUuid: string, projectUuid: string) =>
            `/workspaces/${workspaceUuid}/projects/${projectUuid}`,
        label: '// PROJECT',
    },
} as const;
