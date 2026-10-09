import { Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceHeader } from '@features/workspaces/manager/components/WorkspaceHeader';
import { files } from '@features/workspaces/files/routes/routes';

export function WorkspaceDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();

    const handleCreateFile = () => {
        if (uuid) {
            navigate(files.create.build(uuid));
        }
    };

    return (
        <WorkspaceHeader
            title="Work Space"
            subtitle={`// ${uuid ?? 'UNKNOWN'}`}
            action={
                <Button color="inherit" onClick={handleCreateFile}>
                    Create File
                </Button>
            }
        />
    );
}
