import { Box, Menu, MenuItem, TextField, Typography } from '@mui/material';
import { BLOCK_TYPE_OPTIONS } from '@features/workspaces/files/constants/block.constants';
import type { BlockType } from '@features/workspaces/files/types/block.types';

interface BlockTypeMenuProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    query: string;
    onQueryChange: (query: string) => void;
    onSelect: (type: BlockType) => void;
    onClose: () => void;
}

export function BlockTypeMenu({
    open,
    anchorEl,
    query,
    onQueryChange,
    onSelect,
    onClose,
}: BlockTypeMenuProps) {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredOptions = BLOCK_TYPE_OPTIONS.filter((option) =>
        option.label.toLowerCase().includes(normalizedQuery)
    );

    return (
        <Menu
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            disableRestoreFocus
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{ paper: { sx: { width: 280, maxHeight: 360 } } }}
        >
            <Box sx={{ padding: 1, borderBottom: '1.5px solid', borderColor: 'divider' }}>
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    placeholder="Filter blocks..."
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                />
            </Box>

            {filteredOptions.map((option) => (
                <MenuItem key={option.type} onClick={() => onSelect(option.type)}>
                    {option.label}
                </MenuItem>
            ))}

            {filteredOptions.length === 0 && (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No blocks found
                    </Typography>
                </Box>
            )}
        </Menu>
    );
}
