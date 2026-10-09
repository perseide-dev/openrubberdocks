import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import type { WorkspaceFile } from '@features/workspaces/files/types/file.types';

interface FilesCardsProps {
    files: WorkspaceFile[];
}

export function FilesCards({ files }: FilesCardsProps) {
    if (files.length === 0) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary', padding: 4, textAlign: 'center' }}>
                No files yet. Create a new file to get started.
            </Typography>
        );
    }

    return (
        <Grid container spacing={2}>
            {files.map((file) => (
                <Grid key={file.uuid} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardHeader title={file.title || 'Untitled'} />
                        <CardContent>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Created {new Date(file.createdAt).toLocaleDateString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
