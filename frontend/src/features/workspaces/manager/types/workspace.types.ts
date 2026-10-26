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

export interface UseWorkspaceListParams {
    onOpenWorkspace?: (workspace: Workspace) => void;
}

export interface UseCreateWorkspaceFormParams {
    onSuccess?: () => void;
}

export interface CreateWorkspaceFormController {
    formState: WorkspaceFormState;
    errorMessage: string | null;
    isSubmitting: boolean;
    handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    reset: () => void;
}

export interface WorkspaceCardProps {
    workspace: Workspace;
    onOpen: (workspace: Workspace) => void;
    onDelete?: (workspace: Workspace) => void;
}

export interface CreateWorkspaceDrawerProps {
    open: boolean;
    onClose: () => void;
    form: CreateWorkspaceFormController;
}

export interface WorkspaceAuditTabContentProps {
    workspaceUuid: string;
}


