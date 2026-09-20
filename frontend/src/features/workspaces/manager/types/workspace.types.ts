export interface CreateWorkspacePayload extends Record<string, unknown> {
    name: string;
    description?: string;
}