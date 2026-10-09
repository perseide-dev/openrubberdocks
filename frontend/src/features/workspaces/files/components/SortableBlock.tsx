import { Box, Chip, Divider, IconButton, TextField } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BLOCK_TYPE_OPTIONS } from '@features/workspaces/files/constants/block.constants';
import type { FileEditorBlock } from '@features/workspaces/files/types/block.types';

interface SortableBlockProps {
    block: FileEditorBlock;
    onChange: (id: string, content: string) => void;
    onRemove: (id: string) => void;
}

export function SortableBlock({ block, onChange, onRemove }: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id, data: { source: 'canvas' } });

    const label = BLOCK_TYPE_OPTIONS.find((option) => option.type === block.type)?.label ?? 'Block';

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                border: '1.5px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                padding: 1.5,
            }}
        >
            <IconButton
                size="small"
                aria-label="drag block"
                sx={{ cursor: 'grab', touchAction: 'none' }}
                {...attributes}
                {...listeners}
            >
                <DragIndicatorIcon fontSize="small" />
            </IconButton>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip label={label} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                {block.type === 'divider' ? (
                    <Divider sx={{ marginY: 1.5 }} />
                ) : (
                    <TextField
                        fullWidth
                        multiline
                        value={block.content}
                        onChange={(e) => onChange(block.id, e.target.value)}
                        placeholder={`Write ${label.toLowerCase()}...`}
                    />
                )}
            </Box>

            <IconButton
                size="small"
                aria-label="remove block"
                onClick={() => onRemove(block.id)}
            >
                <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}
