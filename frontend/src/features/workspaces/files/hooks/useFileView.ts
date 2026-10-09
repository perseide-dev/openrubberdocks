import { useMemo } from 'react';
import { useFileDetailService } from '@features/workspaces/files/services/file.service';
import { useFileBlocksService } from '@features/workspaces/files/services/block.service';

export function useFileView(workspaceUuid: string, fileUuid: string) {
    const { data: file, isLoading: isLoadingFile } = useFileDetailService(fileUuid);
    const { data: blocks = [], isLoading: isLoadingBlocks } = useFileBlocksService(fileUuid);

    const sortedBlocks = useMemo(() => {
        return [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
    }, [blocks]);

    return {
        file,
        blocks: sortedBlocks,
        isLoading: isLoadingFile || isLoadingBlocks,
        workspaceUuid,
    };
}
