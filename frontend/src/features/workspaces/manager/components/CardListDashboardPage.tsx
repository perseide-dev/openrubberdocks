import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Skeleton, Alert, Typography } from '@mui/material';
import { useWorkspaceList } from '@features/workspaces/manager/hooks/useWorkspaceList';
import { useDeleteWorkspaceService } from '@features/workspaces/manager/services/workspace.service';
import { WorkspaceCard } from '@features/workspaces/manager/components/WorkspaceCard';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { WORKSPACE_SKELETON_KEYS } from '@features/workspaces/manager/constants/workspace.constants';
import type { Workspace } from '@features/workspaces/manager/types/workspace.types';

/**
 * Renders the grid of available workspaces with loading, error, empty states and deletion modal.
 */
export function CardListDashboardPage() {
    const navigate = useNavigate();
    const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);
    const deleteWorkspaceMutation = useDeleteWorkspaceService();

    const handleOpenWorkspace = useCallback(
        (workspace: Workspace) => navigate(`/workspaces/${workspace.uuid}`),
        [navigate]
    );

    const handleConfirmDelete = async () => {
        if (workspaceToDelete) {
            await deleteWorkspaceMutation.mutateAsync(workspaceToDelete.uuid);
            setWorkspaceToDelete(null);
        }
    };

    const { workspaces, isLoading, isError, errorMessage, isEmpty } =
        useWorkspaceList({ onOpenWorkspace: handleOpenWorkspace });

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                    gap: 3,
                }}
            >
                {WORKSPACE_SKELETON_KEYS.map((key) => (
                    <Card key={key}>
                        <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Skeleton variant="text" width="60%" height={32} />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="80%" />
                        </Box>
                    </Card>
                ))}
            </Box>
        );
    }

    if (isError) {
        return <Alert severity="error" variant="filled">{errorMessage}</Alert>;
    }

    if (isEmpty) {
        return (
            <Card sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="h6" component="div">
                    // NO WORKSPACES YET
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
                    Use "Create Space" to provision your first workspace.
                </Typography>
            </Card>
        );
    }

    return (
        <>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                    gap: 3,
                }}
            >
                {workspaces.map((workspace) => (
                    <WorkspaceCard
                        key={workspace.uuid}
                        workspace={workspace}
                        onOpen={handleOpenWorkspace}
                        onDelete={setWorkspaceToDelete}
                    />
                ))}
            </Box>

            <ConfirmModal
                open={Boolean(workspaceToDelete)}
                title={`DELETE WORKSPACE: ${workspaceToDelete?.name || ''}`}
                description={`Are you sure you want to delete "${workspaceToDelete?.name}"? All associated files, blocks, and permissions will be permanently removed. This action cannot be undone.`}
                isLoading={deleteWorkspaceMutation.isPending}
                onConfirm={handleConfirmDelete}
                onClose={() => setWorkspaceToDelete(null)}
            />
        </>
    );
}
