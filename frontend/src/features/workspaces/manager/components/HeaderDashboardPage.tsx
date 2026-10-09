import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useCreateWorkspaceDrawer } from '@features/workspaces/manager/hooks/useCreateWorkspaceDrawer';
import { CreateWorkspaceDrawer } from '@features/workspaces/manager/components/CreateWorkspaceDrawer';

export function HeaderDashboardPage() {
    const { isOpen, handleOpen, handleClose, form } = useCreateWorkspaceDrawer();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Work Spaces
                    </Typography>
                    <Button color="inherit" onClick={handleOpen}>
                        Create Space
                    </Button>
                </Toolbar>
            </AppBar>

            <CreateWorkspaceDrawer open={isOpen} onClose={handleClose} form={form} />
        </Box>
    );
}
