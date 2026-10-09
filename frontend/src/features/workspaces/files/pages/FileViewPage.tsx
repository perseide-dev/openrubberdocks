import { Box, Button, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceHeader } from '@features/workspaces/manager/components/WorkspaceHeader';
import { FileViewer } from '@features/workspaces/files/components/FileViewer';
import { useFileView } from '@features/workspaces/files/hooks/useFileView';
import { files } from '@features/workspaces/files/routes/routes';

export function FileViewPage() {
    const { workspaceUuid, fileUuid } = useParams<{ workspaceUuid: string; fileUuid: string }>();
    const navigate = useNavigate();
    const wsUuid = workspaceUuid ?? '';
    const fUuid = fileUuid ?? '';
    const { file, blocks, isLoading } = useFileView(wsUuid, fUuid);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WorkspaceHeader
                title={file?.title || 'Untitled'}
                subtitle={`// ${wsUuid}`}
                action={
                    <Button
                        color="inherit"
                        onClick={() => navigate(files.edit.build(wsUuid, fUuid))}
                        disabled={isLoading || !file}
                    >
                        Edit
                    </Button>
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
