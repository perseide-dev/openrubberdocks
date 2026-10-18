import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { FileViewer } from '@features/workspaces/files/components/FileViewer';
import { useFileView } from '@features/workspaces/files/hooks/useFileView';
import { files } from '@features/workspaces/files/routes/routes';
import { usePermissions } from '@global-hooks/usePermissions';

export function FileViewPage() {
    const { workspaceUuid, fileUuid } = useParams<{ workspaceUuid: string; fileUuid: string }>();
    const navigate = useNavigate();
    const wsUuid = workspaceUuid ?? '';
    const fUuid = fileUuid ?? '';
    const { file, blocks, isLoading } = useFileView(wsUuid, fUuid);
    const { canMutateInWorkspace } = usePermissions();
    const canMutate = canMutateInWorkspace(wsUuid);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WorkspaceHeader
                title={file?.title || 'Untitled'}
                subtitle={`// ${wsUuid}`}
                action={
                    canMutate ? (
                        <Button
                            color="inherit"
                            onClick={() => navigate(files.edit.build(wsUuid, fUuid))}
                            disabled={isLoading || !file}
                        >
                            Edit
                        </Button>
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
            <Box sx={{ padding: 2 }}>
                {isLoading ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Loading...
                    </Typography>
                ) : (
                    <FileViewer blocks={blocks} />
                )}
            </Box>
        </Box>
    );
}
