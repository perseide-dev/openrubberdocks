import { Card, CardActionArea, CardContent, CardHeader, Grid, Typography, IconButton, Box, Chip } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { Can } from '@components/ui';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import type { FilesCardsProps } from '@features-workspaces/files/types/file.types';
import { files as filesRoutes } from '@features-workspaces/files/routes/routes';

export function FilesCards({ files, onDelete }: FilesCardsProps) {
    const navigate = useNavigate();
    const { uuid: workspaceUuid } = useParams<{ uuid: string }>();
    const wsUuid = workspaceUuid ?? '';

    if (files.length === 0) {
        return (
            <Typography variant="body2" sx={{ color: 'text.secondary', padding: 4, textAlign: 'center', fontFamily: 'monospace' }}>
                // NO_FILES_YET. Create a new file to get started.
            </Typography>
        );
    }

    return (
        <Grid container spacing={2}>
            {files.map((file) => (
                <Grid key={file.uuid} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            borderRadius: 0,
                            boxShadow: 'none',
                        }}
                    >
                        {file.coverImage && (
                            <Box
                                sx={{
                                    height: 64,
                                    backgroundImage: `url("${file.coverImage}")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderBottom: '1.5px solid',
                                    borderColor: 'divider',
                                }}
                            />
                        )}
                        <CardHeader
                            avatar={file.icon ? <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>{file.icon}</Typography> : undefined}
                            title={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: 'monospace' }} noWrap>
                                        {file.title || 'Untitled'}
                                    </Typography>
                                    {file.isTemplate && (
                                        <Chip
                                            label="// TEMPLATE"
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            sx={{ fontSize: '0.65rem', height: 18, borderRadius: 0, fontFamily: 'monospace', fontWeight: 700 }}
                                        />
                                    )}
                                </Box>
                            }
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
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
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
