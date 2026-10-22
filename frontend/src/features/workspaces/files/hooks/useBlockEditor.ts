import { useState, useCallback, useRef, type KeyboardEvent } from 'react';
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
    const selector = useBlockSelector();
    const inputRefs = useRef(new Map<string, HTMLTextAreaElement>());
    const pendingFocusId = useRef<string | null>(null);

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

            updateBlock(id, content);
        },
        [selector, blocks, updateBlock, convertBlock]
    );

    const handleBlockKeyDown = useCallback(
        (id: string, event: KeyboardEvent<HTMLElement>) => {
            if (selector.isOpen) {
                return;
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
            }
        },
        [selector.isOpen, blocks, addBlock, convertBlock, removeBlock, closeSelector, focusBlock]
    );

    const reset = useCallback(() => {
        setBlocks([]);
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
        registerInput,
        focusBlock,
        reset,
    };
}
