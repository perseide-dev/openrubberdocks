import { Box, Chip } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BLOCK_TYPE_OPTIONS } from '@features/workspaces/files/constants/block.constants';
import type { BlockType, BlockTypeOption } from '@features/workspaces/files/types/block.types';

interface DraggableBlockTypeProps {
    option: BlockTypeOption;
    onAdd: (type: BlockType) => void;
}

function DraggableBlockType({ option, onAdd }: DraggableBlockTypeProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `palette-${option.type}`,
        data: { source: 'palette', blockType: option.type },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
    };

    return (
        <Chip
            ref={setNodeRef}
            style={style}
            label={option.label}
            variant="outlined"
            onClick={() => onAdd(option.type)}
            sx={{ cursor: 'grab' }}
            {...attributes}
            {...listeners}
        />
    );
}

interface BlockPaletteProps {
    onAdd: (type: BlockType) => void;
}

/**
 * Palette of draggable block types. Items can be dragged onto the canvas or
 * clicked to append.
 */
export function BlockPalette({ onAdd }: BlockPaletteProps) {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {BLOCK_TYPE_OPTIONS.map((option) => (
                <DraggableBlockType key={option.type} option={option} onAdd={onAdd} />
            ))}
        </Box>
    );
}
