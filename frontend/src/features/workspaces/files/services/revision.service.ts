import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getFileRevisionsRepository,
    createFileRevisionSnapshotRepository,
    restoreFileRevisionRepository,
} from '@features-workspaces/files/repositories/revision.repository';
import {
    REVISION_QUERY_KEYS,
    REVISION_DEFAULTS,
} from '@features-workspaces/files/constants/revision.constants';
import { FILE_QUERY_KEYS } from '@features-workspaces/files/constants/file.constants';
import { BLOCK_QUERY_KEYS } from '@features-workspaces/files/constants/block.constants';
import { clearDraft } from '@features-workspaces/files/utils/draft-storage.utils';
import type { FileRevision, RestoreRevisionVariables } from '@features-workspaces/files/types/revision.types';
import type { WorkspaceFile } from '@features-workspaces/files/types/file.types';
import type { AppError } from '@http-error/http-error.handler';

/**
 * Service hook to query all revisions for a specific file.
 */
export function useFileRevisionsService(fileUuid: string) {
    return useQuery<FileRevision[], AppError>({
        queryKey: REVISION_QUERY_KEYS.LIST(fileUuid),
        queryFn: () => getFileRevisionsRepository(fileUuid),
        enabled: Boolean(fileUuid),
        staleTime: REVISION_DEFAULTS.STALE_TIME,
    });
}

/**
 * Service hook to trigger an on-demand snapshot of a file.
 */
export function useCreateFileRevisionService() {
    const queryClient = useQueryClient();

    return useMutation<FileRevision, AppError, string>({
        mutationFn: (fileUuid: string) => createFileRevisionSnapshotRepository(fileUuid),
        onSuccess: (_data, fileUuid) => {
            queryClient.invalidateQueries({
                queryKey: REVISION_QUERY_KEYS.LIST(fileUuid),
            });
        },
    });
}

/**
 * Service hook to restore a past revision checkpoint.
 * Automatically invalidates file details, block collections, and revisions list.
 */
export function useRestoreFileRevisionService() {
    const queryClient = useQueryClient();

    return useMutation<WorkspaceFile, AppError, RestoreRevisionVariables>({
        mutationFn: ({ fileUuid, revisionUuid, workspaceUuid }: RestoreRevisionVariables) =>
            restoreFileRevisionRepository(fileUuid, revisionUuid, workspaceUuid),
        onSuccess: async (_data, { fileUuid, workspaceUuid }) => {
            if (workspaceUuid) {
                clearDraft(workspaceUuid, fileUuid);
            }
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: FILE_QUERY_KEYS.DETAIL(fileUuid),
                    refetchType: 'all',
                }),
                queryClient.invalidateQueries({
                    queryKey: [...BLOCK_QUERY_KEYS.ALL, { fileUuid }],
                    refetchType: 'all',
                }),
                queryClient.invalidateQueries({
                    queryKey: BLOCK_QUERY_KEYS.ALL,
                    refetchType: 'all',
                }),
                queryClient.invalidateQueries({
                    queryKey: REVISION_QUERY_KEYS.LIST(fileUuid),
                    refetchType: 'all',
                }),
            ]);
        },
    });
}
