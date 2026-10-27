import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography, IconButton, Chip } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { Can } from '@components/ui';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import type { FilesTableProps } from '@features-workspaces/files/types/file.types';
import { files as filesRoutes } from '@features-workspaces/files/routes/routes';

export function FilesTable({ files, onDelete }: FilesTableProps) {
    const navigate = useNavigate();
    const { uuid: workspaceUuid } = useParams<{ uuid: string }>();
    const wsUuid = workspaceUuid ?? '';

    if (files.length === 0) {
        return (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    // NO_FILES_YET. Create a new file to get started.
                </Typography>
            </Box>
        );
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>// NAME</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>// CREATED_AT</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>// UPDATED_AT</TableCell>
                    {onDelete && <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>// ACTIONS</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {files.map((file) => (
                    <TableRow
                        key={file.uuid}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(filesRoutes.view.build(wsUuid, file.uuid))}
                    >
                        <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {file.icon && (
                                    <Typography sx={{ fontSize: '1.15rem', lineHeight: 1 }}>
                                        {file.icon}
                                    </Typography>
                                )}
                                <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>
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
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{new Date(file.createdAt).toLocaleString()}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{new Date(file.updatedAt).toLocaleString()}</TableCell>
                        {onDelete && (
                            <TableCell align="right">
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
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
