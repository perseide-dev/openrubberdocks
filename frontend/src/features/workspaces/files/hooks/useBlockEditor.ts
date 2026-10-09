import { useState, useCallback } from 'react';
import {
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { BlockType, FileEditorBlock } from '@features/workspaces/files/types/block.types';

/**
 * Manages the local, Notion-like block canvas: creation, edition, removal and
 * drag-and-drop ordering for the file editor.
 */
export function useBlockEditor() {
    const [blocks, setBlocks] = useState<FileEditorBlock[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const addBlock = useCallback((type: BlockType, overId?: string) => {
        setBlocks((prev) => {
            const newBlock: FileEditorBlock = {
                id: crypto.randomUUID(),
                type,
                content: '',
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
    }, []);

    const updateBlock = useCallback((id: string, content: string) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id ? { ...block, content } : block))
        );
    }, []);

    const removeBlock = useCallback((id: string) => {
        setBlocks((prev) => prev.filter((block) => block.id !== id));
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over) {
                return;
            }

            if (active.data.current?.source === 'palette') {
                const blockType = active.data.current.blockType as BlockType;
                addBlock(blockType, String(over.id));
                return;
            }

            if (active.id !== over.id) {
                setBlocks((prev) => {
                    const oldIndex = prev.findIndex((block) => block.id === active.id);
                    const newIndex = prev.findIndex((block) => block.id === over.id);
                    if (oldIndex === -1 || newIndex === -1) {
                        return prev;
                    }
                    return arrayMove(prev, oldIndex, newIndex);
                });
            }
        },
        [addBlock]
    );

    const reset = useCallback(() => {
        setBlocks([]);
    }, []);

    return {
        blocks,
        sensors,
        collisionDetection: closestCenter,
        addBlock,
        updateBlock,
        removeBlock,
        handleDragEnd,
        reset,
    };
}

export type BlockEditorController = ReturnType<typeof useBlockEditor>;
