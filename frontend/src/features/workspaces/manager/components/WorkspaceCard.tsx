import { Card, CardHeader, CardContent, Typography, IconButton } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Can } from '@components/ui/Can';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import type { WorkspaceCardProps } from '@features/workspaces/manager/types/workspace.types';

/**
 * Presentational card summarizing a single workspace with optional deletion action.
 */
export function WorkspaceCard({ workspace, onOpen, onDelete }: WorkspaceCardProps) {
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
                action={
                    onDelete && (
                        <Can action={BASE_PERMISSIONS_ACTIONS.WORKSPACE_WRITE} scope={workspace.uuid}>
                            <IconButton
                                size="small"
                                color="inherit"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(workspace);
                                }}
                                sx={{ '&:hover': { color: 'error.main' } }}
                                title="Delete Workspace"
                            >
                                <DeleteOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Can>
                    )
                }
            />
            <CardContent>
                <Typography variant="body2">
                    {workspace.description || '// NO DESCRIPTION'}
                </Typography>
            </CardContent>
        </Card>
    );
}
