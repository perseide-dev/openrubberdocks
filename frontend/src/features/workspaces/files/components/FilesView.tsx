import { Box, Button, ButtonGroup } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import { FilesTable } from '@features/workspaces/files/components/FilesTable';
import { FilesCards } from '@features/workspaces/files/components/FilesCards';
import type { FilesViewProps } from '@features/workspaces/files/types/file.types';

export function FilesView({ files, viewMode, onViewModeChange, onDeleteFile }: FilesViewProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ButtonGroup variant="outlined" size="small">
                    <Button
                        startIcon={<ViewListIcon />}
                        variant={viewMode === 'table' ? 'contained' : 'outlined'}
                        onClick={() => onViewModeChange('table')}
                    >
                        Table
                    </Button>
                    <Button
                        startIcon={<GridViewIcon />}
                        variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                        onClick={() => onViewModeChange('cards')}
                    >
                        Cards
                    </Button>
                </ButtonGroup>
            </Box>

            {viewMode === 'table' ? (
                <FilesTable files={files} onDelete={onDeleteFile} />
            ) : (
                <FilesCards files={files} onDelete={onDeleteFile} />
            )}
        </Box>
    );
}
