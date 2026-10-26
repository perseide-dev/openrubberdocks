import { useMemo } from 'react';
import { useWorkspaceFilesService } from '@features-workspaces/files/services/file.service';
import { useWorkspaceDetailService } from '@features-workspaces/manager/services/workspace.service';
import { buildPageTree } from '@utils-functions/tree.utils';

export function usePageTreeSidebar(workspaceUuid: string) {
    const { data: workspaceData } = useWorkspaceDetailService(workspaceUuid);
    const { data: filesData = [], isLoading } = useWorkspaceFilesService(workspaceUuid);

    const pageTree = useMemo(() => {
        return buildPageTree(filesData);
    }, [filesData]);

    return {
        workspaceData,
        filesData,
        pageTree,
        isLoading,
    };
}
