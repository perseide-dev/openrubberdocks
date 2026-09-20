export const WORKSPACE_ENDPOINTS = {
    BASE: 'workspaces',
    BY_UUID: (uuid: string) => `workspaces/${uuid}`,
} as const;