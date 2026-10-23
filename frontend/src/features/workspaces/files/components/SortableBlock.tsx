import { useCallback, type KeyboardEvent, type ClipboardEvent, type MouseEvent } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockContent } from '@features/workspaces/files/components/BlockContent';
import type { FileEditorBlock } from '@features/workspaces/files/types/block.types';

interface SortableBlockProps {
    block: FileEditorBlock;
    number?: number;
    isSelected?: boolean;
    onChange: (id: string, content: string) => void;
    onKeyDown: (id: string, event: KeyboardEvent<HTMLElement>) => void;
    onPaste?: (id: string, event: ClipboardEvent<HTMLElement>) => void;
    onMouseDown?: (id: string, event: MouseEvent<HTMLElement>) => void;
    onPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
    onMouseEnter?: (id: string) => void;
    onRemove: (id: string) => void;
    onToggleChecked: (id: string) => void;
    onInsert: (element: HTMLElement, blockId: string) => void;
    registerInput: (id: string, element: HTMLTextAreaElement | null) => void;
}

const ghostButtonSx = {
    border: 'none',
    backgroundColor: 'transparent',
    padding: '3px',
    color: 'text.secondary',
    '&:hover': {
        backgroundColor: 'transparent',
        color: 'text.primary',
        border: 'none',
    },
};

export function SortableBlock({
    block,
    number,
    isSelected,
    onChange,
    onKeyDown,
    onPaste,
    onMouseDown,
    onPointerMove,
    onMouseEnter,
    onRemove,
    onToggleChecked,
    onInsert,
    registerInput,
}: SortableBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id, data: { source: 'canvas' } });

    const setInputRef = useCallback(
        (element: HTMLTextAreaElement | null) => registerInput(block.id, element),
        [block.id, registerInput]
    );

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLTextAreaElement>) => onKeyDown(block.id, event),
        [block.id, onKeyDown]
    );

    const handleChange = useCallback(
        (content: string) => onChange(block.id, content),
        [block.id, onChange]
    );

    return (
        <Box
            ref={setNodeRef}
            style={style}
            data-block="true"
            data-block-id={block.id}
            data-selected-block={isSelected ? 'true' : undefined}
            onMouseDown={(event) => onMouseDown?.(block.id, event)}
            onPointerMove={onPointerMove}
            onMouseEnter={() => onMouseEnter?.(block.id)}
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                padding: '4px 6px',
                userSelect: isSelected ? 'none' : 'auto',
                border: '1.5px solid',
                borderColor: isDragging
                    ? 'primary.main'
                    : isSelected
                    ? 'primary.main'
                    : 'transparent',
                backgroundColor: isDragging
                    ? 'action.hover'
                    : isSelected
                    ? 'action.selected'
                    : 'transparent',
                opacity: isDragging ? 0.55 : 1,
                transition: 'background-color 0.12s ease, border-color 0.12s ease',
                '&:hover': {
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    backgroundColor: isSelected ? 'action.selected' : 'action.hover',
                },
                '&:hover .block-actions, &:focus-within .block-actions': {
                    opacity: 1,
                },
            }}
        >
            <Box
                className="block-actions"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    paddingTop: '2px',
                    opacity: 0,
                    transition: 'opacity 0.12s ease',
                }}
            >
                <Tooltip title="Add block below">
                    <IconButton
                        size="small"
                        aria-label="insert block below"
                        onClick={(event) => onInsert(event.currentTarget, block.id)}
                        sx={ghostButtonSx}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Drag to reorder">
                    <IconButton
                        ref={setActivatorNodeRef}
                        size="small"
                        aria-label="drag block"
                        data-drag-handle="true"
                        sx={{ ...ghostButtonSx, cursor: 'grab', touchAction: 'none' }}
                        {...attributes}
                        {...listeners}
                    >
                        <DragIndicatorIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <BlockContent
                    block={block}
                    number={number}
                    inputRef={setInputRef}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={(event) => onPaste?.(block.id, event)}
                    onToggleChecked={() => onToggleChecked(block.id)}
                />
            </Box>

            <Box
                className="block-actions"
                sx={{
                    paddingTop: '2px',
                    opacity: 0,
                    transition: 'opacity 0.12s ease',
                }}
            >
                <Tooltip title="Delete block">
                    <IconButton
                        size="small"
                        aria-label="remove block"
                        onClick={() => onRemove(block.id)}
                        sx={ghostButtonSx}
                    >
                        <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}
