import { Box, Button, Typography } from '@mui/material';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BlockTypeMenu } from '@features/workspaces/files/components/BlockTypeMenu';
import { SortableBlock } from '@features/workspaces/files/components/SortableBlock';
import { BLOCK_SLASH_TRIGGER } from '@features/workspaces/files/constants/block.constants';
import type { BlockEditorController } from '@features/workspaces/files/hooks/useBlockEditor';

interface BlockEditorProps {
    blockEditor: BlockEditorController;
}

export function BlockEditor({ blockEditor }: BlockEditorProps) {
    const {
        blocks,
        sensors,
        collisionDetection,
        selector,
        addBlock,
        toggleChecked,
        removeBlock,
        handleDragEnd,
        handleBlockChange,
        handleBlockKeyDown,
        openInsertSelector,
        closeSelector,
        handleSelectBlockType,
        registerInput,
    } = blockEditor;

    const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box
                    ref={setNodeRef}
                    sx={{
                        minHeight: 240,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 1,
                        border: '1.5px dashed',
                        borderColor: isOver ? 'primary.main' : 'divider',
                        transition: 'border-color 0.12s ease',
                        '&:hover': {
                            borderColor: isOver ? 'primary.main' : 'text.disabled',
                        },
                    }}
                >
                    <SortableContext
                        items={blocks.map((block) => block.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {blocks.map((block, index) => {
                            let numberedCounter = 0;
                            let currentIndex = index;
                            while (currentIndex >= 0 && blocks[currentIndex].type === 'numbered_list') {
                                currentIndex -= 1;
                                numberedCounter += 1;
                            }
                            const number = block.type === 'numbered_list' ? numberedCounter : undefined;

                            return (
                                <SortableBlock
                                    key={block.id}
                                    block={block}
                                    number={number}
                                    onChange={handleBlockChange}
                                    onKeyDown={handleBlockKeyDown}
                                    onRemove={removeBlock}
                                    onToggleChecked={toggleChecked}
                                    onInsert={openInsertSelector}
                                    registerInput={registerInput}
                                />
                            );
                        })}
                    </SortableContext>

                    {blocks.length === 0 && (
                        <Box
                            sx={{
                                margin: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1.5,
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Start with a text block, or type {'"'}
                                {BLOCK_SLASH_TRIGGER}
                                {'"'} to choose a block type.
                            </Typography>
                            <Button variant="outlined" size="small" onClick={() => addBlock('text')}>
                                Add block
                            </Button>
                        </Box>
                    )}
                </Box>

                {blocks.length > 0 && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => addBlock('text')}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        + Add block
                    </Button>
                )}
            </Box>

            <BlockTypeMenu
                open={selector.isOpen}
                anchorEl={selector.anchorEl}
                query={selector.query}
                onQueryChange={selector.setQuery}
                onSelect={handleSelectBlockType}
                onClose={closeSelector}
            />
        </DndContext>
    );
}
