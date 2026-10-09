import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getFilesRepository,
    getFileByUuidRepository,
    createFileRepository,
    updateFileRepository,
    deleteFileRepository,
} from '@features/workspaces/files/repositories/file.repository';
import {
    FILE_QUERY_KEYS,
    FILE_MUTATION_KEYS,
    FILE_DEFAULTS,
} from '@features/workspaces/files/constants/file.constants';
import { BLOCK_QUERY_KEYS } from '@features/workspaces/files/constants/block.constants';
import type {
    WorkspaceFile,
    CreateFilePayload,
    UpdateFileVariables,
} from '@features/workspaces/files/types/file.types';
import type { AppError } from '@http-error/http-error.handler';

export function useFilesService() {
    return useQuery<WorkspaceFile[], AppError>({
        queryKey: FILE_QUERY_KEYS.ALL,
        queryFn: getFilesRepository,
        staleTime: FILE_DEFAULTS.STALE_TIME,
    });
}

export function useWorkspaceFilesService(workspaceUuid: string) {
    return useQuery<WorkspaceFile[], AppError>({
        queryKey: [...FILE_QUERY_KEYS.ALL, { workspaceUuid }],
        queryFn: () => getFilesRepository({ workspaceUuid }),
        enabled: Boolean(workspaceUuid),
        staleTime: FILE_DEFAULTS.STALE_TIME,
    });
}

export function useFileDetailService(uuid: string) {
    return useQuery<WorkspaceFile, AppError>({
        queryKey: FILE_QUERY_KEYS.DETAIL(uuid),
        queryFn: () => getFileByUuidRepository(uuid),
        enabled: Boolean(uuid),
        staleTime: FILE_DEFAULTS.STALE_TIME,
    });
}

export function useCreateFileService() {
    const queryClient = useQueryClient();

    return useMutation<WorkspaceFile, AppError, CreateFilePayload>({
        mutationKey: FILE_MUTATION_KEYS.CREATE,
        mutationFn: (payload) => createFileRepository(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.ALL });
        },
    });
}

export function useUpdateFileService() {
    const queryClient = useQueryClient();

    return useMutation<WorkspaceFile, AppError, UpdateFileVariables>({
        mutationKey: FILE_MUTATION_KEYS.UPDATE,
        mutationFn: ({ uuid, payload }) => updateFileRepository(uuid, payload),
        onSuccess: (file) => {
            queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.ALL });
            queryClient.invalidateQueries({
                queryKey: FILE_QUERY_KEYS.DETAIL(file.uuid),
            });
        },
    });
}

export function useDeleteFileService() {
    const queryClient = useQueryClient();

    return useMutation<void, AppError, string>({
        mutationKey: FILE_MUTATION_KEYS.DELETE,
        mutationFn: (uuid) => deleteFileRepository(uuid),
        onSuccess: (_data, uuid) => {
            queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.ALL });
            queryClient.removeQueries({ queryKey: FILE_QUERY_KEYS.DETAIL(uuid) });
            queryClient.invalidateQueries({ queryKey: BLOCK_QUERY_KEYS.ALL });
        },
    });
}
