import { Button } from '@mui/material';
import { useCreateWorkspaceDrawer } from '@features/workspaces/manager/hooks/useCreateWorkspaceDrawer';
import { CreateWorkspaceDrawer } from '@features/workspaces/manager/components/CreateWorkspaceDrawer';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';

export function HeaderDashboardPage() {
    const { isOpen, handleOpen, handleClose, form } = useCreateWorkspaceDrawer();

    return (
        <>
            <WorkspaceHeader
                title="Work Spaces"
                action={
                    <Button color="inherit" onClick={handleOpen}>
                        Create Space
                    </Button>
                }
            />

            <CreateWorkspaceDrawer open={isOpen} onClose={handleClose} form={form} />
        </>
    );
}
