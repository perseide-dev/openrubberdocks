export interface WorkspaceFile {
    id: string;
    uuid: string;
    workspaceUuid: string;
    parentPageUuid: string | null;
    title: string;
    icon: string | null;
    coverImage: string | null;
    isTemplate: boolean;
    createdByUuid: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFilePayload extends Record<string, unknown> {
    workspaceUuid: string;
    parentPageUuid?: string;
    title: string;
    icon?: string;
    coverImage?: string;
    isTemplate?: boolean;
}

export interface UpdateFilePayload extends Record<string, unknown> {
    parentPageUuid?: string;
    title?: string;
    icon?: string;
    coverImage?: string;
    isTemplate?: boolean;
}

export interface UpdateFileVariables {
    uuid: string;
    payload: UpdateFilePayload;
}

export interface FileFilters {
    workspaceUuid?: string;
    parentPageUuid?: string;
    isTemplate?: boolean;
    search?: string;
    sortBy?: 'title' | 'createdAt' | 'updatedAt';
}
