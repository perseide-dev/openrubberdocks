import { useMemo, useState } from 'react';
import { useWorkspaceFilesService } from '@features/workspaces/files/services/file.service';

export type FilesViewMode = 'table' | 'cards';

export function useWorkspaceFiles(workspaceUuid: string) {
    const [viewMode, setViewMode] = useState<FilesViewMode>('table');
    const { data = [], isLoading, isFetching } = useWorkspaceFilesService(workspaceUuid);

    const sortedFiles = useMemo(() => {
        return [...data].sort((a, b) => a.title.localeCompare(b.title));
    }, [data]);

    return {
        files: sortedFiles,
        isLoading,
        isFetching,
        viewMode,
        setViewMode,
    };
}
