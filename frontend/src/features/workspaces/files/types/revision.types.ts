export interface BlockSnapshotItem {
    uuid?: string;
    type: string;
    orderIndex: number;
    properties: Record<string, unknown>;
}

export interface FileRevisionAuthor {
    id: number;
    uuid: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface FileRevision {
    id: number;
    uuid: string;
    fileUuid: string;
    title: string;
    blocksSnapshot: BlockSnapshotItem[];
    createdBy?: FileRevisionAuthor;
    createdByUuid?: string;
    createdAt: string;
}

export interface RestoreRevisionVariables {
    fileUuid: string;
    revisionUuid: string;
}

export interface RevisionItemCardProps {
    revision: FileRevision;
    isCurrent?: boolean;
    isSelected?: boolean;
    canRestore?: boolean;
    isRestoring?: boolean;
    onSelect?: (revision: FileRevision) => void;
    onRestoreClick?: (revision: FileRevision) => void;
}

export interface RevisionHistoryDrawerProps {
    open: boolean;
    onClose: () => void;
    fileUuid: string;
    workspaceUuid: string;
    canRestore: boolean;
}

export interface UseFileRevisionsReturn {
    revisions: FileRevision[];
    isLoading: boolean;
    isError: boolean;
    selectedRevision: FileRevision | null;
    isConfirmOpen: boolean;
    isRestoring: boolean;
    handleSelectRevision: (revision: FileRevision) => void;
    handleOpenConfirm: (revision: FileRevision) => void;
    handleCloseConfirm: () => void;
    handleConfirmRestore: () => Promise<void>;
}
