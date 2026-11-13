import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
    type UseQueryResult,
} from '@tanstack/react-query';
import type { AppError } from '@http-error/http-error.handler';
import { storageRepository } from '@features-workspaces/files/repositories/storage.repository';
import {
    STORAGE_DEFAULTS,
    STORAGE_MUTATION_KEYS,
    STORAGE_QUERY_KEYS,
} from '@features-workspaces/files/constants/storage.constants';
import type {
    StorageAttachment,
    StorageQuotaStatus,
    UploadStorageAttachmentVariables,
    WorkspaceTaskMentionItem,
} from '@features-workspaces/files/types/storage.types';

export function useWorkspaceStorageQuotaService(
    workspaceUuid: string,
): UseQueryResult<StorageQuotaStatus, AppError> {
    return useQuery<StorageQuotaStatus, AppError>({
        queryKey: STORAGE_QUERY_KEYS.QUOTA(workspaceUuid),
        queryFn: () => storageRepository.getWorkspaceQuota(workspaceUuid),
        enabled: Boolean(workspaceUuid),
        staleTime: STORAGE_DEFAULTS.STALE_TIME,
    });
}

export function useWorkspaceAttachmentsService(
    workspaceUuid: string,
): UseQueryResult<StorageAttachment[], AppError> {
    return useQuery<StorageAttachment[], AppError>({
        queryKey: STORAGE_QUERY_KEYS.LIST(workspaceUuid),
        queryFn: () => storageRepository.listWorkspaceAttachments(workspaceUuid),
        enabled: Boolean(workspaceUuid),
        staleTime: STORAGE_DEFAULTS.STALE_TIME,
    });
}

export function useWorkspaceTasksMentionsService(
    workspaceUuid: string,
): UseQueryResult<WorkspaceTaskMentionItem[], AppError> {
    return useQuery<WorkspaceTaskMentionItem[], AppError>({
        queryKey: STORAGE_QUERY_KEYS.WORKSPACE_TASKS(workspaceUuid),
        queryFn: () => storageRepository.getWorkspaceTasksForMentions(workspaceUuid),
        enabled: Boolean(workspaceUuid),
        staleTime: STORAGE_DEFAULTS.STALE_TIME,
    });
}

export function useUploadStorageAttachmentService(): UseMutationResult<
    StorageAttachment,
    AppError,
    UploadStorageAttachmentVariables
> {
    const queryClient = useQueryClient();

    return useMutation<StorageAttachment, AppError, UploadStorageAttachmentVariables>({
        mutationKey: STORAGE_MUTATION_KEYS.UPLOAD,
        mutationFn: (variables) => storageRepository.uploadAttachment(variables),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({
                queryKey: STORAGE_QUERY_KEYS.QUOTA(variables.workspaceUuid),
            });
            void queryClient.invalidateQueries({
                queryKey: STORAGE_QUERY_KEYS.LIST(variables.workspaceUuid),
            });
        },
    });
}

export function useDeleteStorageAttachmentService(
    workspaceUuid: string,
): UseMutationResult<void, AppError, string> {
    const queryClient = useQueryClient();

    return useMutation<void, AppError, string>({
        mutationKey: STORAGE_MUTATION_KEYS.DELETE,
        mutationFn: (uuid) => storageRepository.deleteAttachment(uuid),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: STORAGE_QUERY_KEYS.QUOTA(workspaceUuid),
            });
            void queryClient.invalidateQueries({
                queryKey: STORAGE_QUERY_KEYS.LIST(workspaceUuid),
            });
        },
    });
}
