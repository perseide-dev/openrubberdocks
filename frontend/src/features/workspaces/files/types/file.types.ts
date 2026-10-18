export interface WorkspaceFile {
    id: string;
    uuid: string;
    workspaceUuid: string;
    parentPageUuid: string | null;
    parentPage?: WorkspaceFile;
    childPages?: WorkspaceFile[];
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

export type FilesViewMode = 'table' | 'cards';

export interface FilesCardsProps {
    files: WorkspaceFile[];
    onDelete?: (file: WorkspaceFile) => void;
}

export interface FilesTableProps {
    files: WorkspaceFile[];
    onDelete?: (file: WorkspaceFile) => void;
}

export interface FilesViewProps {
    files: WorkspaceFile[];
    viewMode: FilesViewMode;
    onViewModeChange: (mode: FilesViewMode) => void;
    onDeleteFile?: (file: WorkspaceFile) => void;
}

export interface PageTreeNode {
    file: WorkspaceFile;
    children: PageTreeNode[];
    level: number;
}

export interface PageTreeItemProps {
    node: PageTreeNode;
    activeFileUuid?: string;
    workspaceUuid: string;
    onSelectPage: (fileUuid: string) => void;
    onCreateSubPage?: (parentPageUuid: string) => void;
}

export interface PageTreeSidebarProps {
    workspaceUuid: string;
    activeFileUuid?: string;
    onCloseMobile?: () => void;
}

export type { BreadcrumbItem, BrutalistBreadcrumbsProps } from '@components/ui';

