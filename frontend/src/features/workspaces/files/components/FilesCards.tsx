import { Card, CardActionArea, CardContent, CardHeader, Grid, Typography, IconButton } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Can } from '@components/ui/Can';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import type { FilesCardsProps } from '@features/workspaces/files/types/file.types';
import { files as filesRoutes } from '@features/workspaces/files/routes/routes';

export function FilesCards({ files, onDelete }: FilesCardsProps) {
    const navigate = useNavigate();
    const { uuid: workspaceUuid } = useParams<{ uuid: string }>();
    const wsUuid = workspaceUuid ?? '';

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
                    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
                        <CardHeader
                            title={file.title || 'Untitled'}
                            action={
                                onDelete && (
                                    <Can action={BASE_PERMISSIONS_ACTIONS.DOCUMENT_WRITE} scope={wsUuid}>
                                        <IconButton
                                            size="small"
                                            color="inherit"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(file);
                                            }}
                                            sx={{ '&:hover': { color: 'error.main' } }}
                                            title="Delete Document"
                                        >
                                            <DeleteOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    </Can>
                                )
                            }
                        />
                        <CardActionArea
                            onClick={() => navigate(filesRoutes.view.build(wsUuid, file.uuid))}
                            sx={{ flexGrow: 1 }}
                        >
                            <CardContent>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Created {new Date(file.createdAt).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
