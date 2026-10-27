import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWorkspacesRepository,
    getWorkspaceByUuidRepository,
    createWorkspaceRepository,
    updateWorkspaceRepository,
    deleteWorkspaceRepository,
} from '@features/workspaces/manager/repositories/workspace.repository';
import {
    WORKSPACE_QUERY_KEYS,
    WORKSPACE_MUTATION_KEYS,
    WORKSPACE_DEFAULTS,
} from '@features/workspaces/manager/constants/workspace.constants';
import type {
    Workspace,
    CreateWorkspacePayload,
    UpdateWorkspaceVariables,
} from '@features/workspaces/manager/types/workspace.types';
import type { AppError } from '@http-error/http-error.handler';

/**
 * Service hook to query and cache the workspace list.
 */
export function useWorkspacesService() {
    return useQuery<Workspace[], AppError>({
        queryKey: WORKSPACE_QUERY_KEYS.ALL,
        queryFn: getWorkspacesRepository,
        staleTime: WORKSPACE_DEFAULTS.STALE_TIME,
    });
}

/**
 * Service hook to query and cache a single workspace detail by UUID.
 */
export function useWorkspaceDetailService(uuid: string) {
    return useQuery<Workspace, AppError>({
        queryKey: WORKSPACE_QUERY_KEYS.DETAIL(uuid),
        queryFn: () => getWorkspaceByUuidRepository(uuid),
        enabled: Boolean(uuid),
        staleTime: WORKSPACE_DEFAULTS.STALE_TIME,
    });
}

/**
 * Service mutation hook to create a workspace and invalidate listings.
 */
export function useCreateWorkspaceService() {
    const queryClient = useQueryClient();

    return useMutation<Workspace, AppError, CreateWorkspacePayload>({
        mutationKey: WORKSPACE_MUTATION_KEYS.CREATE,
        mutationFn: (payload) => createWorkspaceRepository(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.ALL });
        },
    });
}

/**
 * Service mutation hook to update a workspace and refresh affected caches.
 */
export function useUpdateWorkspaceService() {
    const queryClient = useQueryClient();

    return useMutation<Workspace, AppError, UpdateWorkspaceVariables>({
        mutationKey: WORKSPACE_MUTATION_KEYS.UPDATE,
        mutationFn: ({ uuid, payload }) => updateWorkspaceRepository(uuid, payload),
        onSuccess: (workspace) => {
            queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.ALL });
            queryClient.invalidateQueries({
                queryKey: WORKSPACE_QUERY_KEYS.DETAIL(workspace.uuid),
            });
        },
    });
}

/**
 * Service mutation hook to delete a workspace and purge related caches.
 */
export function useDeleteWorkspaceService() {
    const queryClient = useQueryClient();

    return useMutation<void, AppError, string>({
        mutationKey: WORKSPACE_MUTATION_KEYS.DELETE,
        mutationFn: (uuid) => deleteWorkspaceRepository(uuid),
        onSuccess: (_data, uuid) => {
            queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.ALL });
            queryClient.removeQueries({
                queryKey: WORKSPACE_QUERY_KEYS.DETAIL(uuid),
            });
        },
    });
}
