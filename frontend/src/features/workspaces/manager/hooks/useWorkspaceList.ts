import { useCallback } from 'react';
import { useWorkspacesService } from '@features/workspaces/manager/services/workspace.service';
import { WORKSPACE_MESSAGES } from '@features/workspaces/manager/constants/workspace.constants';
import type { Workspace } from '@features/workspaces/manager/types/workspace.types';

interface UseWorkspaceListParams {
    onOpenWorkspace?: (workspace: Workspace) => void;
}

/**
 * View controller hook for the workspace card list.
 * Exposes the query state and a prepared handler for opening a workspace.
 */
export function useWorkspaceList({ onOpenWorkspace }: UseWorkspaceListParams = {}) {
    const workspacesQuery = useWorkspacesService();

    const workspaces = workspacesQuery.data ?? [];

    const handleOpenWorkspace = useCallback(
        (workspace: Workspace) => {
            onOpenWorkspace?.(workspace);
        },
        [onOpenWorkspace]
    );

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
    };
}
