import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface WorkspaceHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

/**
 * Reusable header bar for workspace views.
 * Renders a title, optional subtitle and an optional action slot.
 */
export function WorkspaceHeader({ title, subtitle, action }: WorkspaceHeaderProps) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    {action}
                </Toolbar>
            </AppBar>
        </Box>
    );
}
