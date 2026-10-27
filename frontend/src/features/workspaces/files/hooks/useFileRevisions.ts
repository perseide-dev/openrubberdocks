import { useState, useCallback } from 'react';
import {
    useFileRevisionsService,
    useRestoreFileRevisionService,
} from '@features-workspaces/files/services/revision.service';
import type {
    FileRevision,
    UseFileRevisionsReturn,
} from '@features-workspaces/files/types/revision.types';

/**
 * Custom UI hook managing file revisions state, drawer selection, and restore workflows.
 */
export function useFileRevisions(
    fileUuid: string,
    workspaceUuid?: string,
    onRestoreSuccess?: () => void,
): UseFileRevisionsReturn {
    const { data: revisions = [], isLoading, isError } = useFileRevisionsService(fileUuid);
    const restoreMutation = useRestoreFileRevisionService();

    const [selectedRevision, setSelectedRevision] = useState<FileRevision | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleSelectRevision = useCallback((revision: FileRevision) => {
        setSelectedRevision(revision);
    }, []);

    const handleOpenConfirm = useCallback((revision: FileRevision) => {
        setSelectedRevision(revision);
        setIsConfirmOpen(true);
    }, []);

    const handleCloseConfirm = useCallback(() => {
        setIsConfirmOpen(false);
    }, []);

    const handleConfirmRestore = useCallback(async () => {
        if (!selectedRevision || !fileUuid) return;
        try {
            await restoreMutation.mutateAsync({
                fileUuid,
                revisionUuid: selectedRevision.uuid,
                workspaceUuid,
            });
            setIsConfirmOpen(false);
            setSelectedRevision(null);
            onRestoreSuccess?.();
        } catch {
            // Error handling managed by service / snackbar
        }
    }, [selectedRevision, fileUuid, workspaceUuid, restoreMutation, onRestoreSuccess]);

    return {
        revisions,
        isLoading,
        isError,
        selectedRevision,
        isConfirmOpen,
        isRestoring: restoreMutation.isPending,
        handleSelectRevision,
        handleOpenConfirm,
        handleCloseConfirm,
        handleConfirmRestore,
    };
}
