import { useState, useCallback } from 'react';
import {
    useWorkspaceDetailService,
    useDeleteWorkspaceService,
} from '@features-workspaces/manager/services/workspace.service';
import { useDeleteFileService } from '@features-workspaces/files/services/file.service';
import type { WorkspaceFile } from '@features-workspaces/files/types/file.types';

export function useWorkspaceDetail(workspaceUuid: string) {
    const { data: workspace, isLoading } = useWorkspaceDetailService(workspaceUuid);
    const deleteWorkspaceMutation = useDeleteWorkspaceService();
    const deleteFileMutation = useDeleteFileService();

    const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<WorkspaceFile | null>(null);

    const deleteWorkspace = useCallback(async () => {
        if (!workspaceUuid) return;
        await deleteWorkspaceMutation.mutateAsync(workspaceUuid);
        setIsDeleteWorkspaceOpen(false);
    }, [workspaceUuid, deleteWorkspaceMutation]);

    const deleteFile = useCallback(async () => {
        if (!fileToDelete) return;
        await deleteFileMutation.mutateAsync(fileToDelete.uuid);
        setFileToDelete(null);
    }, [fileToDelete, deleteFileMutation]);

    return {
        workspace,
        isLoading,
        isDeleteWorkspaceOpen,
        setIsDeleteWorkspaceOpen,
        fileToDelete,
        setFileToDelete,
        deleteWorkspace,
        isDeletingWorkspace: deleteWorkspaceMutation.isPending,
        deleteFile,
        isDeletingFile: deleteFileMutation.isPending,
    };
}
