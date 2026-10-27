import { useMemo, useCallback } from 'react';
import {
    useFileDetailService,
    useWorkspaceFilesService,
    useDeleteFileService,
} from '@features-workspaces/files/services/file.service';
import { useFileBlocksService } from '@features-workspaces/files/services/block.service';
import { useWorkspaceDetailService } from '@features-workspaces/manager/services/workspace.service';

export function useFileView(workspaceUuid: string, fileUuid: string) {
    const { data: file, isLoading: isLoadingFile } = useFileDetailService(fileUuid);
    const { data: blocks = [], isLoading: isLoadingBlocks } = useFileBlocksService(fileUuid);
    const { data: allFiles = [] } = useWorkspaceFilesService(workspaceUuid);
    const { data: workspace } = useWorkspaceDetailService(workspaceUuid);
    const deleteFileMutation = useDeleteFileService();

    const sortedBlocks = useMemo(() => {
        return [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
    }, [blocks]);

    const deleteFile = useCallback(
        async (targetFileUuid: string) => {
            await deleteFileMutation.mutateAsync(targetFileUuid);
        },
        [deleteFileMutation]
    );

    return {
        file,
        blocks: sortedBlocks,
        allFiles,
        workspace,
        isLoading: isLoadingFile || isLoadingBlocks,
        isDeleting: deleteFileMutation.isPending,
        deleteFile,
        workspaceUuid,
    };
}
