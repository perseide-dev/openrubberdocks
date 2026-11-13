import { baseAPIrequest } from '@http-base/baseAPIrequest';
import { env } from '@config-env';
import { STORAGE_ENDPOINTS } from '@features-workspaces/files/constants/storage.constants';
import type {
    StorageAttachment,
    StorageQuotaStatus,
    UploadStorageAttachmentVariables,
    WorkspaceTaskMentionItem,
} from '@features-workspaces/files/types/storage.types';

export const storageRepository = {
    async uploadAttachment(
        variables: UploadStorageAttachmentVariables,
    ): Promise<StorageAttachment> {
        const formData = new FormData();
        formData.append('workspaceUuid', variables.workspaceUuid);
        if (variables.fileUuid) {
            formData.append('fileUuid', variables.fileUuid);
        }
        formData.append('file', variables.file);

        return await baseAPIrequest.post<StorageAttachment>(
            STORAGE_ENDPOINTS.UPLOAD,
            formData,
            { wrapJsonApi: false },
        );
    },

    async getWorkspaceQuota(workspaceUuid: string): Promise<StorageQuotaStatus> {
        return await baseAPIrequest.get<StorageQuotaStatus>(
            STORAGE_ENDPOINTS.QUOTA(workspaceUuid),
        );
    },

    async listWorkspaceAttachments(workspaceUuid: string): Promise<StorageAttachment[]> {
        return await baseAPIrequest.get<StorageAttachment[]>(
            STORAGE_ENDPOINTS.WORKSPACE_LIST(workspaceUuid),
        );
    },

    async deleteAttachment(uuid: string): Promise<void> {
        await baseAPIrequest.delete<void>(STORAGE_ENDPOINTS.DELETE(uuid));
    },

    async getWorkspaceTasksForMentions(
        workspaceUuid: string,
    ): Promise<WorkspaceTaskMentionItem[]> {
        return await baseAPIrequest.get<WorkspaceTaskMentionItem[]>(
            STORAGE_ENDPOINTS.WORKSPACE_TASKS(workspaceUuid),
        );
    },

    buildAttachmentContentUrl(attachmentUuid: string): string {
        const base = env.API_URL.replace(/\/+$/, '');
        return `${base}/${STORAGE_ENDPOINTS.ATTACHMENT_CONTENT(attachmentUuid)}`;
    },
};
