import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Skeleton, Alert, Typography } from '@mui/material';
import { useWorkspaceList } from '@features/workspaces/manager/hooks/useWorkspaceList';
import { WorkspaceCard } from '@features/workspaces/manager/components/WorkspaceCard';
import type { Workspace } from '@features/workspaces/manager/types/workspace.types';

const SKELETON_KEYS = ['skeleton-1', 'skeleton-2', 'skeleton-3'] as const;

/**
 * Renders the grid of available workspaces with loading, error and empty states.
 */
export function CardListDashboardPage() {
    const navigate = useNavigate();

    const handleOpenWorkspace = useCallback(
        (workspace: Workspace) => navigate(`/workspaces/${workspace.uuid}`),
        [navigate]
    );

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
                {SKELETON_KEYS.map((key) => (
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
            <Box
                sx={{
                    border: '1.5px solid',
                    borderColor: 'divider',
                    padding: 4,
                    textAlign: 'center',
                    backgroundColor: 'background.paper',
                }}
            >
                <Typography variant="h6" component="div">
                    // NO WORKSPACES YET
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
                    Use "Create Space" to provision your first workspace.
                </Typography>
            </Box>
        );
    }

    return (
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
                />
            ))}
        </Box>
    );
}
