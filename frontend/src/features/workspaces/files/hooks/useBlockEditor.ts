import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react';
import {
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBlockSelector } from '@features/workspaces/files/hooks/useBlockSelector';
import { BLOCK_SLASH_TRIGGER } from '@features/workspaces/files/constants/block.constants';
import { parseMarkdownToBlocks, serializeBlocksToMarkdown } from '@features/workspaces/files/utils/markdown-block.parser';
import type {
    BlockType,
    FileEditorBlock,
    BlockEditorController,
} from '@features/workspaces/files/types/block.types';

/**
 * Manages the local, Notion-like block canvas: creation, edition, conversion,
 * removal, drag-and-drop ordering, the floating block selector and the keyboard
 * shortcuts that keep the editing flow uninterrupted.
 */
export function useBlockEditor(): BlockEditorController {
    const [blocks, setBlocks] = useState<FileEditorBlock[]>([]);
    const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
    const selector = useBlockSelector();
    const inputRefs = useRef(new Map<string, HTMLTextAreaElement>());
    const pendingFocusId = useRef<string | null>(null);

    const selectAllBlocks = useCallback(() => {
        setSelectedBlockIds(blocks.map((b) => b.id));
    }, [blocks]);

    const clearBlockSelection = useCallback(() => {
        setSelectedBlockIds([]);
    }, []);

    const deleteSelectedBlocks = useCallback(() => {
        setSelectedBlockIds((prevSelected) => {
            if (prevSelected.length === 0) return prevSelected;
            setBlocks((prevBlocks) => {
                const remaining = prevBlocks.filter((b) => !prevSelected.includes(b.id));
                if (remaining.length === 0) {
                    const newId = crypto.randomUUID();
                    pendingFocusId.current = newId;
                    return [{ id: newId, type: 'text', content: '' }];
                }
                pendingFocusId.current = remaining[0].id;
                return remaining;
            });
            return [];
        });
    }, []);

    const dragStartBlockId = useRef<string | null>(null);

    const handleBlockMouseDown = useCallback(
        (id: string, e: React.MouseEvent<HTMLElement>) => {
            if (e.button === 0) {
                dragStartBlockId.current = id;
                if (selectedBlockIds.length > 0 && !selectedBlockIds.includes(id)) {
                    setSelectedBlockIds([]);
                }
            }
        },
        [selectedBlockIds]
    );

    const handleBlockMouseEnter = useCallback(
        (id: string) => {
            if (!dragStartBlockId.current) return;
            if (dragStartBlockId.current === id) return;

            const startIndex = blocks.findIndex((b) => b.id === dragStartBlockId.current);
            const currentIndex = blocks.findIndex((b) => b.id === id);

            if (startIndex !== -1 && currentIndex !== -1) {
                const min = Math.min(startIndex, currentIndex);
                const max = Math.max(startIndex, currentIndex);
                const range = blocks.slice(min, max + 1).map((b) => b.id);
                setSelectedBlockIds(range);
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            }
        },
        [blocks]
    );

    useEffect(() => {
        const handleWindowMouseUp = () => {
            dragStartBlockId.current = null;
        };

        const handleCopy = (e: ClipboardEvent) => {
            if (selectedBlockIds.length > 0) {
                e.preventDefault();
                const selected = blocks.filter((b) => selectedBlockIds.includes(b.id));
                const md = serializeBlocksToMarkdown(selected);
                if (e.clipboardData) {
                    e.clipboardData.setData('text/plain', md);
                } else {
                    void navigator.clipboard.writeText(md);
                }
            }
        };

        window.addEventListener('mouseup', handleWindowMouseUp);
        document.addEventListener('copy', handleCopy);

        return () => {
            window.removeEventListener('mouseup', handleWindowMouseUp);
            document.removeEventListener('copy', handleCopy);
        };
    }, [selectedBlockIds, blocks]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const registerInput = useCallback((id: string, element: HTMLTextAreaElement | null) => {
        if (!element) {
            inputRefs.current.delete(id);
            return;
        }

        inputRefs.current.set(id, element);
        if (pendingFocusId.current === id) {
            pendingFocusId.current = null;
            element.focus();
        }
    }, []);

    const focusBlock = useCallback((id: string) => {
        const element = inputRefs.current.get(id);
        if (element) {
            element.focus();
            return;
        }
        pendingFocusId.current = id;
    }, []);

    const addBlock = useCallback((type: BlockType, overId?: string) => {
        const id = crypto.randomUUID();

        setBlocks((prev) => {
            const newBlock: FileEditorBlock = {
                id,
                type,
                content: '',
                checked: type === 'todo' ? false : undefined,
            };

            if (!overId) {
                return [...prev, newBlock];
            }

            const overIndex = prev.findIndex((block) => block.id === overId);
            if (overIndex === -1) {
                return [...prev, newBlock];
            }

            const next = [...prev];
            next.splice(overIndex + 1, 0, newBlock);
            return next;
        });

        pendingFocusId.current = id;
        return id;
    }, []);

    const updateBlock = useCallback((id: string, content: string) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id ? { ...block, content } : block))
        );
    }, []);

    const convertBlock = useCallback((id: string, type: BlockType, content?: string) => {
        setBlocks((prev) =>
            prev.map((block) =>
                block.id === id
                    ? {
                          ...block,
                          type,
                          content: content !== undefined ? content : '',
                          checked: type === 'todo' ? block.checked ?? false : undefined,
                      }
                    : block
            )
        );
    }, []);

    const toggleChecked = useCallback((id: string) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id ? { ...block, checked: !block.checked } : block))
        );
    }, []);

    const removeBlock = useCallback((id: string) => {
        setBlocks((prev) => prev.filter((block) => block.id !== id));
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }

        setBlocks((prev) => {
            const oldIndex = prev.findIndex((block) => block.id === active.id);
            const newIndex = prev.findIndex((block) => block.id === over.id);
            if (oldIndex === -1 || newIndex === -1) {
                return prev;
            }
            return arrayMove(prev, oldIndex, newIndex);
        });
    }, []);

    const openInsertSelector = useCallback(
        (element: HTMLElement, blockId: string) => {
            selector.open({ element, blockId, mode: 'insert', query: '' });
        },
        [selector]
    );

    const closeSelector = useCallback(() => {
        if (selector.mode === 'convert' && selector.targetBlockId) {
            const targetId = selector.targetBlockId;
            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === targetId && block.content.startsWith(BLOCK_SLASH_TRIGGER)
                        ? { ...block, content: '' }
                        : block
                )
            );
            focusBlock(targetId);
        }
        selector.close();
    }, [selector, focusBlock]);

    const handleSelectBlockType = useCallback(
        (type: BlockType) => {
            if (!selector.targetBlockId) {
                selector.close();
                return;
            }

            if (selector.mode === 'convert') {
                const targetId = selector.targetBlockId;
                convertBlock(targetId, type);
                selector.close();
                focusBlock(targetId);
                return;
            }

            addBlock(type, selector.targetBlockId);
            selector.close();
        },
        [selector, convertBlock, addBlock, focusBlock]
    );

    const handleBlockChange = useCallback(
        (id: string, content: string) => {
            if (content.startsWith(BLOCK_SLASH_TRIGGER)) {
                setBlocks((prev) =>
                    prev.map((block) => (block.id === id ? { ...block, content } : block))
                );
                const element = document.activeElement;
                selector.open({
                    element: element instanceof HTMLElement ? element : document.body,
                    blockId: id,
                    mode: 'convert',
                    query: content.slice(BLOCK_SLASH_TRIGGER.length),
                });
                return;
            }

            const currentBlock = blocks.find((b) => b.id === id);

            if (currentBlock?.type === 'text') {
                const matchNumbered = content.match(/^(\d+)[.)]\s(.*)$/);
                if (matchNumbered) {
                    convertBlock(id, 'numbered_list', matchNumbered[2]);
                    return;
                }
                if (content.startsWith('- ') || content.startsWith('* ')) {
                    convertBlock(id, 'bullet_list', content.slice(2));
                    return;
                }
                if (content.startsWith('[] ') || content.startsWith('[ ] ')) {
                    const remaining = content.startsWith('[] ') ? content.slice(3) : content.slice(4);
                    convertBlock(id, 'todo', remaining);
                    return;
                }
                if (content.startsWith('### ')) {
                    convertBlock(id, 'heading_3', content.slice(4));
                    return;
                }
                if (content.startsWith('## ')) {
                    convertBlock(id, 'heading_2', content.slice(3));
                    return;
                }
                if (content.startsWith('# ')) {
                    convertBlock(id, 'heading_1', content.slice(2));
                    return;
                }
                if (content.startsWith('> ')) {
                    convertBlock(id, 'quote', content.slice(2));
                    return;
                }
            } else if (currentBlock?.type === 'numbered_list') {
                const matchNumbered = content.match(/^(\d+)[.)]\s(.*)$/);
                if (matchNumbered) {
                    updateBlock(id, matchNumbered[2]);
                    return;
                }
            }

            if (selectedBlockIds.length > 0) {
                setSelectedBlockIds([]);
            }
            updateBlock(id, content);
        },
        [selector, blocks, updateBlock, convertBlock, selectedBlockIds.length]
    );

    const handleBlockPaste = useCallback(
        (id: string, event: React.ClipboardEvent<HTMLElement>) => {
            const clipboardText = event.clipboardData.getData('text/plain');
            if (!clipboardText) return;

            const hasNewlines = clipboardText.includes('\n');
            const hasMarkdownTriggers = /^(\s*[-*+]|\s*\d+[.)]|\s*#|\s*>|\s*```|!\[)/m.test(clipboardText);

            if (!hasNewlines && !hasMarkdownTriggers) {
                return;
            }

            event.preventDefault();
            const parsed = parseMarkdownToBlocks(clipboardText);
            if (parsed.length === 0) return;

            setBlocks((prev) => {
                const targetIndex = prev.findIndex((b) => b.id === id);
                if (targetIndex === -1) {
                    return prev;
                }

                const targetBlock = prev[targetIndex];
                const shouldReplace = targetBlock.content.trim() === '' && targetBlock.type === 'text';

                const newBlocks: FileEditorBlock[] = parsed.map((p) => ({
                    id: crypto.randomUUID(),
                    type: p.type,
                    content: p.content,
                    checked: p.checked,
                }));

                const nextBlocks = [...prev];
                if (shouldReplace) {
                    nextBlocks.splice(targetIndex, 1, ...newBlocks);
                } else {
                    nextBlocks.splice(targetIndex + 1, 0, ...newBlocks);
                }

                const lastNewBlock = newBlocks[newBlocks.length - 1];
                if (lastNewBlock) {
                    pendingFocusId.current = lastNewBlock.id;
                }

                return nextBlocks;
            });
            setSelectedBlockIds([]);
        },
        []
    );

    const handleBlockKeyDown = useCallback(
        (id: string, event: KeyboardEvent<HTMLElement>) => {
            if (selector.isOpen) {
                return;
            }

            // Full file selection via Ctrl+A / Cmd+A
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                selectAllBlocks();
                return;
            }

            // Actions when multiple/all blocks are selected
            if (selectedBlockIds.length > 0) {
                if (event.key === 'Backspace' || event.key === 'Delete') {
                    event.preventDefault();
                    deleteSelectedBlocks();
                    return;
                }
                if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
                    event.preventDefault();
                    const selected = blocks.filter((b) => selectedBlockIds.includes(b.id));
                    const md = serializeBlocksToMarkdown(selected);
                    void navigator.clipboard.writeText(md);
                    return;
                }
                if (event.key === 'Escape') {
                    event.preventDefault();
                    clearBlockSelection();
                    return;
                }
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    event.preventDefault();
                    deleteSelectedBlocks();
                    return;
                }
            }

            const block = blocks.find((item) => item.id === id);
            if (!block) {
                return;
            }

            if (event.key === 'Enter' && !event.shiftKey && block.type !== 'code') {
                event.preventDefault();

                if (['numbered_list', 'bullet_list', 'todo'].includes(block.type)) {
                    if (block.content.trim() === '') {
                        convertBlock(id, 'text');
                        return;
                    }
                    addBlock(block.type, id);
                    return;
                }

                addBlock('text', id);
                return;
            }

            if (event.key === 'Backspace' && block.content === '') {
                event.preventDefault();

                if (block.type !== 'text') {
                    convertBlock(id, 'text');
                    return;
                }

                const index = blocks.findIndex((item) => item.id === id);
                const previous = blocks[index - 1];
                removeBlock(id);
                if (previous) {
                    focusBlock(previous.id);
                }
                return;
            }

            if (event.key === 'Escape') {
                closeSelector();
                clearBlockSelection();
            }
        },
        [
            selector.isOpen,
            selectAllBlocks,
            selectedBlockIds,
            deleteSelectedBlocks,
            blocks,
            clearBlockSelection,
            addBlock,
            convertBlock,
            removeBlock,
            closeSelector,
            focusBlock,
        ]
    );

    const reset = useCallback(() => {
        setBlocks([]);
        setSelectedBlockIds([]);
        inputRefs.current.clear();
        pendingFocusId.current = null;
    }, []);

    return {
        blocks,
        sensors,
        collisionDetection: closestCenter,
        selector,
        addBlock,
        updateBlock,
        convertBlock,
        toggleChecked,
        removeBlock,
        handleDragEnd,
        handleBlockChange,
        handleBlockKeyDown,
        openInsertSelector,
        closeSelector,
        handleSelectBlockType,
        selectedBlockIds,
        selectAllBlocks,
        clearBlockSelection,
        deleteSelectedBlocks,
        handleBlockPaste,
        handleBlockMouseDown,
        handleBlockMouseEnter,
        registerInput,
        focusBlock,
        reset,
    };
}
