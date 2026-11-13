import type { DragEvent } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { DndContext, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BlockTypeMenu } from '@features-workspaces/files/components/BlockTypeMenu';
import { SortableBlock } from '@features-workspaces/files/components/SortableBlock';
import { BLOCK_SLASH_TRIGGER } from '@features-workspaces/files/constants/block.constants';
import type { BlockEditorProps } from '@features-workspaces/files/types/block.types';

export function BlockEditor({ blockEditor }: BlockEditorProps) {
    const {
        blocks,
        sensors,
        collisionDetection,
        selector,
        addBlock,
        updateBlockProperties,
        toggleChecked,
        removeBlock,
        handleDragEnd,
        handleBlockChange,
        handleBlockKeyDown,
        openInsertSelector,
        closeSelector,
        handleSelectBlockType,
        selectedBlockIds,
        handleBlockPaste,
        handleBinaryUpload,
        isUploadingBinary,
        mentionCandidates,
        workspaceUuid,
        handleBlockMouseDown,
        handleBlockMouseEnter,
        handleCanvasMouseDown,
        handlePointerMove,
        clearBlockSelection,
        registerInput,
    } = blockEditor;

    const { setNodeRef } = useDroppable({ id: 'canvas' });

    const handleCanvasFileDrop = (event: DragEvent<HTMLDivElement>) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0 || !handleBinaryUpload) return;
        event.preventDefault();
        const file = files[0];
        if (file) {
            const preferredType = file.type.startsWith('image/') ? 'image' : 'file_attachment';
            void handleBinaryUpload(file, undefined, preferredType);
        }
    };

    const handleCanvasDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (event.dataTransfer?.types?.includes('Files')) {
            event.preventDefault();
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragEnd={handleDragEnd}
        >
            <Box
                onMouseDown={handleCanvasMouseDown}
                onPointerMove={handlePointerMove}
                onDoubleClick={(e) => {
                    const target = e.target as HTMLElement | null;
                    if (!target?.closest('[data-block="true"]')) {
                        clearBlockSelection();
                    }
                }}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
                <Paper
                    ref={setNodeRef}
                    variant="outlined"
                    onMouseDown={handleCanvasMouseDown}
                    onPointerMove={handlePointerMove}
                    onDrop={handleCanvasFileDrop}
                    onDragOver={handleCanvasDragOver}
                    onDoubleClick={(e) => {
                        const target = e.target as HTMLElement | null;
                        if (!target?.closest('[data-block="true"]')) {
                            clearBlockSelection();
                        }
                    }}
                    sx={{
                        minHeight: 240,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 1,
                    }}
                >
                    <SortableContext
                        items={blocks.map((block) => block.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {blocks.map((block, index) => {
                            let numberedCounter = 0;
                            let currentIndex = index;
                            while (currentIndex >= 0) {
                                if (blocks[currentIndex].type === 'numbered_list') {
                                    numberedCounter += 1;
                                    currentIndex -= 1;
                                } else if (
                                    blocks[currentIndex].type === 'text' &&
                                    blocks[currentIndex].content.trim() === ''
                                ) {
                                    currentIndex -= 1;
                                } else {
                                    break;
                                }
                            }
                            const number =
                                block.type === 'numbered_list' ? numberedCounter : undefined;

                            return (
                                <SortableBlock
                                    key={block.id}
                                    block={block}
                                    number={number}
                                    isSelected={selectedBlockIds.includes(block.id)}
                                    onChange={handleBlockChange}
                                    onUpdateProperties={updateBlockProperties}
                                    onUploadBinary={
                                        handleBinaryUpload
                                            ? (blockId, file, preferred) =>
                                                  handleBinaryUpload(file, blockId, preferred)
                                            : undefined
                                    }
                                    isUploadingBinary={isUploadingBinary}
                                    mentionCandidates={mentionCandidates}
                                    workspaceUuid={workspaceUuid}
                                    onKeyDown={handleBlockKeyDown}
                                    onPaste={handleBlockPaste}
                                    onMouseDown={handleBlockMouseDown}
                                    onPointerMove={handlePointerMove}
                                    onMouseEnter={handleBlockMouseEnter}
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
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Start with a text block, type {'"'}
                                {BLOCK_SLASH_TRIGGER}
                                {'"'} for blocks, or drop binary files here.
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => addBlock('text')}
                            >
                                Add block
                            </Button>
                        </Box>
                    )}
                </Paper>

                {blocks.length > 0 && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                            const lastBlock = blocks[blocks.length - 1];
                            const nextType =
                                lastBlock &&
                                ['numbered_list', 'bullet_list', 'todo'].includes(
                                    lastBlock.type,
                                ) &&
                                lastBlock.content.trim() !== ''
                                    ? lastBlock.type
                                    : 'text';
                            addBlock(nextType);
                        }}
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
