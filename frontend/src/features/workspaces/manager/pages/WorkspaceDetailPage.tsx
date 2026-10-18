import { Box, Button, Tooltip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { FilesView } from '@features/workspaces/files/components/FilesView';
import { useWorkspaceFiles } from '@features/workspaces/files/hooks/useWorkspaceFiles';
import { files } from '@features/workspaces/files/routes/routes';
import { usePermissions } from '@global-hooks/usePermissions';

export function WorkspaceDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const { files: workspaceFiles, viewMode, setViewMode } = useWorkspaceFiles(uuid ?? '');
    const { canMutateInWorkspace } = usePermissions();
    const canMutate = canMutateInWorkspace(uuid);

    const handleCreateFile = () => {
        if (uuid && canMutate) {
            navigate(files.create.build(uuid));
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WorkspaceHeader
                title="Work Space"
                subtitle={`// ${uuid ?? 'UNKNOWN'}`}
                action={
                    canMutate ? (
                        <Button color="inherit" onClick={handleCreateFile}>
                            Create File
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
            <FilesView files={workspaceFiles} viewMode={viewMode} onViewModeChange={setViewMode} />
        </Box>
    );
}
