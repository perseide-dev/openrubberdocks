import { Button } from '@mui/material';
import { useCreateWorkspaceDrawer } from '@features/workspaces/manager/hooks/useCreateWorkspaceDrawer';
import { CreateWorkspaceDrawer } from '@features/workspaces/manager/components/CreateWorkspaceDrawer';
import { WorkspaceHeader } from '@components/ui/WorkspaceHeader';
import { Can } from '@components/ui/Can';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';

export function HeaderDashboardPage() {
    const { isOpen, handleOpen, handleClose, form } = useCreateWorkspaceDrawer();

    return (
        <>
            <WorkspaceHeader
                title="Work Spaces"
                action={
                    <Can action={BASE_PERMISSIONS_ACTIONS.WORKSPACE_CREATE}>
                        <Button color="inherit" onClick={handleOpen}>
                            Create Space
                        </Button>
                    </Can>
                }
            />

            <CreateWorkspaceDrawer open={isOpen} onClose={handleClose} form={form} />
        </>
    );
}
