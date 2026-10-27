import { useState, useMemo, useCallback } from 'react';
import {
    useProjectFilesService,
    useLinkProjectFileService,
    useUnlinkProjectFileService,
} from '@features-workspaces/projects/services/project.service';
import { useWorkspaceFilesService } from '@features-workspaces/files/services/file.service';

export function useProjectFiles(projectUuid: string, workspaceUuid: string) {
    const { data: linkedFiles = [], isLoading } = useProjectFilesService(projectUuid);
    const { data: workspaceFiles = [] } = useWorkspaceFilesService(workspaceUuid);
    const linkMutation = useLinkProjectFileService();
    const unlinkMutation = useUnlinkProjectFileService();

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedFileUuid, setSelectedFileUuid] = useState('');

    const unlinkedFiles = useMemo(() => {
        const linkedUuids = new Set(linkedFiles.map((l) => l.fileUuid));
        return workspaceFiles.filter((f) => !linkedUuids.has(f.uuid));
    }, [linkedFiles, workspaceFiles]);

    const handleLinkFile = useCallback(async () => {
        if (!selectedFileUuid) return;
        await linkMutation.mutateAsync({
            projectUuid,
            payload: { fileUuid: selectedFileUuid },
        });
        setSelectedFileUuid('');
        setIsLinkModalOpen(false);
    }, [selectedFileUuid, projectUuid, linkMutation]);

    const handleUnlink = useCallback(
        async (fileUuid: string) => {
            await unlinkMutation.mutateAsync({
                projectUuid,
                fileUuid,
            });
        },
        [projectUuid, unlinkMutation],
    );

    return {
        linkedFiles,
        unlinkedFiles,
        isLoading,
        isLinkModalOpen,
        setIsLinkModalOpen,
        selectedFileUuid,
        setSelectedFileUuid,
        handleLinkFile,
        handleUnlink,
        isLinking: linkMutation.isPending,
    };
}
