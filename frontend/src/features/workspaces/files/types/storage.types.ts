export type StorageDriverKind = 'local' | 's3';

export interface StorageAttachment {
    id: string;
    uuid: string;
    workspaceUuid: string;
    fileUuid: string | null;
    originalName: string;
    driver: StorageDriverKind;
    mimeType: string;
    sizeBytes: number;
    createdByUuid: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface StorageQuotaStatus {
    id: string;
    uuid: string;
    workspaceUuid: string;
    driver: StorageDriverKind;
    usedBytes: number;
    quotaBytes: number;
    remainingBytes: number;
    usagePercent: number;
    attachmentCount: number;
}

export interface UploadStorageAttachmentVariables {
    workspaceUuid: string;
    fileUuid?: string;
    file: File;
}

export interface WorkspaceTaskMentionItem {
    id: string;
    uuid: string;
    projectUuid: string;
    title: string;
    status?: {
        uuid?: string;
        name?: string;
    };
    project?: {
        uuid?: string;
        name?: string;
    };
}

export type InternalLinkTargetType = 'document' | 'task';

export interface InternalLinkCandidate {
    targetType: InternalLinkTargetType;
    targetUuid: string;
    targetTitle: string;
    subtitle: string;
    projectUuid?: string;
}
