import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography, IconButton } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Can } from '@components/ui/Can';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import type { FilesTableProps } from '@features/workspaces/files/types/file.types';
import { files as filesRoutes } from '@features/workspaces/files/routes/routes';

export function FilesTable({ files, onDelete }: FilesTableProps) {
    const navigate = useNavigate();
    const { uuid: workspaceUuid } = useParams<{ uuid: string }>();
    const wsUuid = workspaceUuid ?? '';

    if (files.length === 0) {
        return (
            <Box sx={{ padding: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No files yet. Create a new file to get started.
                </Typography>
            </Box>
        );
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Updated At</TableCell>
                    {onDelete && <TableCell align="right">Actions</TableCell>}
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
                        <TableCell>{file.title || 'Untitled'}</TableCell>
                        <TableCell>{new Date(file.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{new Date(file.updatedAt).toLocaleString()}</TableCell>
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
