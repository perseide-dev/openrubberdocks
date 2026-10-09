import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getBlocksRepository,
    getBlockByUuidRepository,
    createBlockRepository,
    updateBlockRepository,
    moveBlockRepository,
    deleteBlockRepository,
} from '@features/workspaces/files/repositories/block.repository';
import {
    BLOCK_QUERY_KEYS,
    BLOCK_MUTATION_KEYS,
    BLOCK_DEFAULTS,
} from '@features/workspaces/files/constants/block.constants';
import type {
    WorkspaceBlock,
    CreateBlockPayload,
    UpdateBlockVariables,
    MoveBlockVariables,
} from '@features/workspaces/files/types/block.types';
import type { AppError } from '@http-error/http-error.handler';

/**
 * Service hook to query and cache the blocks list.
 */
export function useBlocksService() {
    return useQuery<WorkspaceBlock[], AppError>({
        queryKey: BLOCK_QUERY_KEYS.ALL,
        queryFn: getBlocksRepository,
        staleTime: BLOCK_DEFAULTS.STALE_TIME,
    });
}

/**
 * Service hook to query and cache a single block detail by UUID.
 */
export function useBlockDetailService(uuid: string) {
    return useQuery<WorkspaceBlock, AppError>({
        queryKey: BLOCK_QUERY_KEYS.DETAIL(uuid),
        queryFn: () => getBlockByUuidRepository(uuid),
        enabled: Boolean(uuid),
        staleTime: BLOCK_DEFAULTS.STALE_TIME,
    });
}

/**
 * Service mutation hook to create a block and invalidate listings.
 */
export function useCreateBlockService() {
    const queryClient = useQueryClient();

    return useMutation<WorkspaceBlock, AppError, CreateBlockPayload>({
        mutationKey: BLOCK_MUTATION_KEYS.CREATE,
        mutationFn: (payload) => createBlockRepository(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BLOCK_QUERY_KEYS.ALL });
        },
    });
}

/**
 * Service mutation hook to update a block and refresh affected caches.
 */
export function useUpdateBlockService() {
    const queryClient = useQueryClient();

    return useMutation<WorkspaceBlock, AppError, UpdateBlockVariables>({
        mutationKey: BLOCK_MUTATION_KEYS.UPDATE,
        mutationFn: ({ uuid, payload }) => updateBlockRepository(uuid, payload),
        onSuccess: (block) => {
            queryClient.invalidateQueries({ queryKey: BLOCK_QUERY_KEYS.ALL });
            queryClient.invalidateQueries({
                queryKey: BLOCK_QUERY_KEYS.DETAIL(block.uuid),
            });
        },
    });
}

/**
 * Service mutation hook to reposition a block and refresh affected caches.
 */
export function useMoveBlockService() {
    const queryClient = useQueryClient();

    return useMutation<WorkspaceBlock, AppError, MoveBlockVariables>({
        mutationKey: BLOCK_MUTATION_KEYS.MOVE,
        mutationFn: ({ uuid, payload }) => moveBlockRepository(uuid, payload),
        onSuccess: (block) => {
            queryClient.invalidateQueries({ queryKey: BLOCK_QUERY_KEYS.ALL });
            queryClient.invalidateQueries({
                queryKey: BLOCK_QUERY_KEYS.DETAIL(block.uuid),
            });
        },
    });
}

/**
 * Service mutation hook to delete a block and purge related caches.
 */
export function useDeleteBlockService() {
    const queryClient = useQueryClient();

    return useMutation<void, AppError, string>({
        mutationKey: BLOCK_MUTATION_KEYS.DELETE,
        mutationFn: (uuid) => deleteBlockRepository(uuid),
        onSuccess: (_data, uuid) => {
            queryClient.invalidateQueries({ queryKey: BLOCK_QUERY_KEYS.ALL });
            queryClient.removeQueries({ queryKey: BLOCK_QUERY_KEYS.DETAIL(uuid) });
        },
    });
}
