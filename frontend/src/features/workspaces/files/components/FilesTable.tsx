import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { WorkspaceFile } from '@features/workspaces/files/types/file.types';

interface FilesTableProps {
    files: WorkspaceFile[];
}

export function FilesTable({ files }: FilesTableProps) {
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
                </TableRow>
            </TableHead>
            <TableBody>
                {files.map((file) => (
                    <TableRow key={file.uuid}>
                        <TableCell>{file.title || 'Untitled'}</TableCell>
                        <TableCell>
                            {new Date(file.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                            {new Date(file.updatedAt).toLocaleString()}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
