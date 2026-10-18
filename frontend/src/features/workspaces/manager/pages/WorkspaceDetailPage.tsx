import { useState } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { FilesView } from '@features/workspaces/files/components/FilesView';
import { useWorkspaceFiles } from '@features/workspaces/files/hooks/useWorkspaceFiles';
import { useWorkspaceDetailService, useDeleteWorkspaceService } from '@features/workspaces/manager/services/workspace.service';
import { useDeleteFileService } from '@features/workspaces/files/services/file.service';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { files } from '@features/workspaces/files/routes/routes';
import { usePermissions } from '@global-hooks/usePermissions';
import type { WorkspaceFile } from '@features/workspaces/files/types/file.types';

export function WorkspaceDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const wsUuid = uuid ?? '';

    const { data: workspace } = useWorkspaceDetailService(wsUuid);
    const { files: workspaceFiles, viewMode, setViewMode } = useWorkspaceFiles(wsUuid);
    const { canMutateInWorkspace } = usePermissions();
    const canMutate = canMutateInWorkspace(wsUuid);

    const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<WorkspaceFile | null>(null);

    const deleteWorkspaceMutation = useDeleteWorkspaceService();
    const deleteFileMutation = useDeleteFileService();

    const handleCreateFile = () => {
        if (wsUuid && canMutate) {
            navigate(files.create.build(wsUuid));
        }
    };

    const handleConfirmDeleteWorkspace = async () => {
        if (wsUuid) {
            await deleteWorkspaceMutation.mutateAsync(wsUuid);
            setIsDeleteWorkspaceOpen(false);
            navigate('/workspaces');
        }
    };

    const handleConfirmDeleteFile = async () => {
        if (fileToDelete) {
            await deleteFileMutation.mutateAsync(fileToDelete.uuid);
            setFileToDelete(null);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WorkspaceHeader
                title={workspace?.name || 'Work Space'}
                subtitle={`// ${wsUuid || 'UNKNOWN'}`}
                action={
                    canMutate ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button color="inherit" onClick={handleCreateFile}>
                                Create File
                            </Button>
                            <Button
                                color="error"
                                variant="outlined"
                                onClick={() => setIsDeleteWorkspaceOpen(true)}
                            >
                                Delete Space
                            </Button>
                        </Box>
                    ) : (
                        <Tooltip title="// ACCESS: READ ONLY - MUTATION LOCKED">
                            <span>
                                <Button color="inherit" disabled>
                                    // READ ONLY
                                </Button>
                            </span>
                        </Tooltip>
                    )
                }
            />
            <FilesView
                files={workspaceFiles}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onDeleteFile={canMutate ? setFileToDelete : undefined}
            />

            {/* Modal: Delete Workspace */}
            <ConfirmModal
                open={isDeleteWorkspaceOpen}
                title={`DELETE WORKSPACE: ${workspace?.name || ''}`}
                description={`Are you sure you want to delete workspace "${workspace?.name}"? All nested files, blocks, and permissions will be permanently destroyed. This action is irreversible.`}
                isLoading={deleteWorkspaceMutation.isPending}
                onConfirm={handleConfirmDeleteWorkspace}
                onClose={() => setIsDeleteWorkspaceOpen(false)}
            />

            {/* Modal: Delete Document/File */}
            <ConfirmModal
                open={Boolean(fileToDelete)}
                title={`DELETE DOCUMENT: ${fileToDelete?.title || 'Untitled'}`}
                description={`Are you sure you want to delete "${fileToDelete?.title || 'Untitled'}"? All contained content blocks and revision snapshots will be permanently deleted.`}
                isLoading={deleteFileMutation.isPending}
                onConfirm={handleConfirmDeleteFile}
                onClose={() => setFileToDelete(null)}
            />
        </Box>
    );
}
