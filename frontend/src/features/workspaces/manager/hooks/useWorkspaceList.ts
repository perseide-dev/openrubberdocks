import { useCallback, useState } from 'react';
import {
    useWorkspacesService,
    useDeleteWorkspaceService,
} from '@features/workspaces/manager/services/workspace.service';
import { WORKSPACE_MESSAGES } from '@features/workspaces/manager/constants/workspace.constants';
import type { Workspace, UseWorkspaceListParams } from '@features/workspaces/manager/types/workspace.types';

/**
 * View controller hook for the workspace card list.
 * Exposes the query state, deletion state, and a prepared handler for opening a workspace.
 */
export function useWorkspaceList({ onOpenWorkspace }: UseWorkspaceListParams = {}) {
    const workspacesQuery = useWorkspacesService();
    const deleteWorkspaceMutation = useDeleteWorkspaceService();
    const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

    const workspaces = workspacesQuery.data ?? [];

    const handleOpenWorkspace = useCallback(
        (workspace: Workspace) => {
            onOpenWorkspace?.(workspace);
        },
        [onOpenWorkspace]
    );

    const handleConfirmDelete = useCallback(async () => {
        if (workspaceToDelete) {
            await deleteWorkspaceMutation.mutateAsync(workspaceToDelete.uuid);
            setWorkspaceToDelete(null);
        }
    }, [workspaceToDelete, deleteWorkspaceMutation]);

    const errorMessage = workspacesQuery.isError
        ? workspacesQuery.error?.errors?.[0]?.detail ||
          workspacesQuery.error?.message ||
          WORKSPACE_MESSAGES.LIST_ERROR
        : null;

    return {
        workspaces,
        isLoading: workspacesQuery.isLoading,
        isError: workspacesQuery.isError,
        errorMessage,
        isEmpty: !workspacesQuery.isLoading && !workspacesQuery.isError && workspaces.length === 0,
        handleOpenWorkspace,
        workspaceToDelete,
        setWorkspaceToDelete,
        handleConfirmDelete,
        isDeleting: deleteWorkspaceMutation.isPending,
    };
}
