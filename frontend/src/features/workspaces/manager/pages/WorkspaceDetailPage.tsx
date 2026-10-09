import { Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { WorkspaceHeader } from '@features/workspaces/manager/components/WorkspaceHeader';

export function WorkspaceDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();

    return (
        <WorkspaceHeader
            title="Work Space"
            subtitle={`// ${uuid ?? 'UNKNOWN'}`}
            action={
                <Button color="inherit">
                    Create File
                </Button>
            }
        />
    );
}
