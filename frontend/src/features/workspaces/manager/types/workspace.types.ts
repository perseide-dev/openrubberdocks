export interface Workspace {
    id: string;
    uuid: string;
    name: string;
    description: string | null;
    createdByUUID: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWorkspacePayload extends Record<string, unknown> {
    name: string;
    description?: string;
}

export interface UpdateWorkspacePayload extends Record<string, unknown> {
    name?: string;
    description?: string;
}

export interface UpdateWorkspaceVariables {
    uuid: string;
    payload: UpdateWorkspacePayload;
}

export interface WorkspaceFilters {
    search?: string;
    sortBy?: 'name' | 'createdAt';
}

export interface WorkspaceFormState {
    name: string;
    description: string;
}
