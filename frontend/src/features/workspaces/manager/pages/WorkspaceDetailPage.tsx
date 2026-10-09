import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { WorkspaceHeader } from '@features/workspaces/manager/components/WorkspaceHeader';
import { FilesView } from '@features/workspaces/files/components/FilesView';
import { useWorkspaceFiles } from '@features/workspaces/files/hooks/useWorkspaceFiles';
import { files } from '@features/workspaces/files/routes/routes';

export function WorkspaceDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const { files: workspaceFiles, viewMode, setViewMode } = useWorkspaceFiles(uuid ?? '');

    const handleCreateFile = () => {
        if (uuid) {
            navigate(files.create.build(uuid));
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WorkspaceHeader
                title="Work Space"
                subtitle={`// ${uuid ?? 'UNKNOWN'}`}
                action={
                    <Button color="inherit" onClick={handleCreateFile}>
                        Create File
                    </Button>
                }
            />
            <FilesView files={workspaceFiles} viewMode={viewMode} onViewModeChange={setViewMode} />
        </Box>
    );
}
