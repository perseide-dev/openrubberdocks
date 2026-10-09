import { Box, Typography } from '@mui/material';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BlockPalette } from '@features/workspaces/files/components/BlockPalette';
import { SortableBlock } from '@features/workspaces/files/components/SortableBlock';
import type { BlockEditorController } from '@features/workspaces/files/hooks/useBlockEditor';

interface BlockEditorProps {
    blockEditor: BlockEditorController;
}

/**
 * Notion-like canvas where palette blocks are dragged in and reordered.
 */
export function BlockEditor({ blockEditor }: BlockEditorProps) {
    const { blocks, sensors, collisionDetection, addBlock, updateBlock, removeBlock, handleDragEnd } =
        blockEditor;

    const { setNodeRef } = useDroppable({ id: 'canvas' });

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <BlockPalette onAdd={(type) => addBlock(type)} />

                <Box
                    ref={setNodeRef}
                    sx={{
                        minHeight: 160,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        border: '1.5px dashed',
                        borderColor: 'divider',
                        padding: 2,
                    }}
                >
                    <SortableContext
                        items={blocks.map((block) => block.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {blocks.map((block) => (
                            <SortableBlock
                                key={block.id}
                                block={block}
                                onChange={updateBlock}
                                onRemove={removeBlock}
                            />
                        ))}
                    </SortableContext>

                    {blocks.length === 0 && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', margin: 'auto' }}>
                            Drag a block here or click one above to start building the file.
                        </Typography>
                    )}
                </Box>
            </Box>
        </DndContext>
    );
}
