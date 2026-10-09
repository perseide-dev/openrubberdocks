import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import type { Workspace } from '@features/workspaces/manager/types/workspace.types';

interface WorkspaceCardProps {
    workspace: Workspace;
    onOpen: (workspace: Workspace) => void;
}

/**
 * Presentational card summarizing a single workspace.
 */
export function WorkspaceCard({ workspace, onOpen }: WorkspaceCardProps) {
    return (
        <Card
            onClick={() => onOpen(workspace)}
            sx={{
                cursor: 'pointer',
                transition: 'background-color 0.1s ease',
                '&:hover': {
                    backgroundColor: 'action.hover',
                },
            }}
        >
            <CardHeader
                title={workspace.name}
                subheader="// WORKSPACE"
            />
            <CardContent>
                <Typography variant="body2">
                    {workspace.description || '// NO DESCRIPTION'}
                </Typography>
            </CardContent>
        </Card>
    );
}
