import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

export function HeaderDashboardPage() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Work Spaces
                    </Typography>
                    <Button color="inherit">Create Space</Button>
                </Toolbar>
            </AppBar>
        </Box>
    )
}