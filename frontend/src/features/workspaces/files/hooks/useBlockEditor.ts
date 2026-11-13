import {
    useState,
    useCallback,
    useRef,
    useEffect,
    type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBlockSelector } from '@features-workspaces/files/hooks/useBlockSelector';
import {
    BLOCK_SLASH_TRIGGER,
    DEFAULT_OPENAPI_SPEC_SAMPLE,
    DEFAULT_TABLE_DATA,
    MERMAID_PRESETS,
} from '@features-workspaces/files/constants/block.constants';
import {
    parseMarkdownToBlocks,
    serializeBlocksToMarkdown,
} from '@features-workspaces/files/utils/markdown-block.parser';
import { serializeTableToMarkdown } from '@features-workspaces/files/utils/table-markdown.utils';
import type {
    BlockType,
    CalloutVariant,
    FileEditorBlock,
    BlockEditorController,
    UseBlockEditorOptions,
} from '@features-workspaces/files/types/block.types';

function getDefaultContentAndProperties(type: BlockType): {
    content: string;
    properties?: Record<string, unknown>;
} {
    switch (type) {
        case 'table': {
            const initialTable = {
                headers: [...DEFAULT_TABLE_DATA.headers],
                rows: DEFAULT_TABLE_DATA.rows.map((r) => [...r]),
            };
            return {
                content: serializeTableToMarkdown(initialTable),
                properties: { table: initialTable },
            };
        }
        case 'callout':
            return {
                content: '',
                properties: { calloutVariant: 'INFO' },
            };
        case 'mermaid':
            return {
                content: MERMAID_PRESETS.architecture.code,
                properties: {},
            };
        case 'openapi_spec':
            return {
                content: DEFAULT_OPENAPI_SPEC_SAMPLE,
                properties: { specFormat: 'yaml' },
            };
        case 'internal_link':
            return {
                content: '',
                properties: { internalLink: {} },
            };
        default:
            return { content: '' };
    }
}

export function useBlockEditor(
    initialBlocks?: FileEditorBlock[],
    options?: UseBlockEditorOptions,
): BlockEditorController {
    const [blocks, setBlocks] = useState<FileEditorBlock[]>(() => initialBlocks ?? []);
    const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
    const selector = useBlockSelector();
    const inputRefs = useRef(new Map<string, HTMLTextAreaElement>());
    const pendingFocusId = useRef<string | null>(null);

    const historyPast = useRef<FileEditorBlock[][]>([]);
    const historyFuture = useRef<FileEditorBlock[][]>([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const isTypingRef = useRef(false);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateCanUndoRedo = useCallback(() => {
        setCanUndo(historyPast.current.length > 0);
        setCanRedo(historyFuture.current.length > 0);
    }, []);

    const pushSnapshot = useCallback(
        (blocksToSnapshot: FileEditorBlock[]) => {
            historyPast.current = [...historyPast.current.slice(-40), blocksToSnapshot];
            historyFuture.current = [];
            updateCanUndoRedo();
        },
        [updateCanUndoRedo],
    );

    const undo = useCallback(() => {
        if (historyPast.current.length === 0) return;
        const previous = historyPast.current.pop()!;
        historyFuture.current.push(blocks);
        setBlocks(previous);
        setSelectedBlockIds([]);
        updateCanUndoRedo();
    }, [blocks, updateCanUndoRedo]);

    const redo = useCallback(() => {
        if (historyFuture.current.length === 0) return;
        const next = historyFuture.current.pop()!;
        historyPast.current.push(blocks);
        setBlocks(next);
        setSelectedBlockIds([]);
        updateCanUndoRedo();
    }, [blocks, updateCanUndoRedo]);

    const setBlocksState = useCallback(
        (newBlocks: FileEditorBlock[]) => {
            setBlocks(newBlocks);
            historyPast.current = [];
            historyFuture.current = [];
            updateCanUndoRedo();
        },
        [updateCanUndoRedo],
    );

    const selectAllBlocks = useCallback(() => {
        setSelectedBlockIds(blocks.map((b) => b.id));
    }, [blocks]);

    const clearBlockSelection = useCallback(() => {
        setSelectedBlockIds([]);
    }, []);

    const deleteSelectedBlocks = useCallback(() => {
        pushSnapshot(blocks);
        isTypingRef.current = false;
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
    }, [blocks, pushSnapshot]);

    const dragStartBlockId = useRef<string | null>(null);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);
    const isDraggingRange = useRef(false);

    const handleBlockMouseDown = useCallback(
        (id: string, e: React.MouseEvent<HTMLElement>) => {
            if (e.button === 0) {
                const target = e.target as HTMLElement | null;
                if (target?.closest('button') || target?.closest('input[type="checkbox"]')) {
                    return;
                }
                dragStartBlockId.current = id;
                dragStartPos.current = { x: e.clientX, y: e.clientY };
                isDraggingRange.current = false;
            }
        },
        [],
    );

    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (e.button === 0) {
            const target = e.target as HTMLElement | null;
            if (target?.closest('[data-block="true"]') || target?.closest('button')) {
                return;
            }
            const blockElements = Array.from(
                document.querySelectorAll<HTMLElement>('[data-block="true"]'),
            );
            let closestId: string | null = null;
            if (blockElements.length > 0) {
                let minDiff = Infinity;
                for (const bEl of blockElements) {
                    const rect = bEl.getBoundingClientRect();
                    const diff = Math.abs(e.clientY - (rect.top + rect.height / 2));
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestId = bEl.getAttribute('data-block-id');
                    }
                }
            }
            dragStartBlockId.current = closestId;
            dragStartPos.current = { x: e.clientX, y: e.clientY };
            isDraggingRange.current = false;
        }
    }, []);

    const handleBlockMouseEnter = useCallback(
        (id: string) => {
            if (!dragStartBlockId.current) return;
            if (dragStartBlockId.current === id) return;

            isDraggingRange.current = true;
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
        [blocks],
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLElement> | PointerEvent | MouseEvent) => {
            if (!dragStartPos.current) return;

            const dist = Math.hypot(
                e.clientX - dragStartPos.current.x,
                e.clientY - dragStartPos.current.y,
            );
            if (dist < 6) return;

            const target = e.target as HTMLElement | null;
            if (
                target &&
                typeof target.releasePointerCapture === 'function' &&
                'pointerId' in e
            ) {
                try {
                    if (target.hasPointerCapture(e.pointerId)) {
                        target.releasePointerCapture(e.pointerId);
                    }
                } catch {
                    // ignore if already released
                }
            }

            const blockElements = Array.from(
                document.querySelectorAll<HTMLElement>('[data-block="true"]'),
            );
            if (blockElements.length === 0 || blocks.length === 0) return;

            let currentId: string | null = null;
            const firstRect = blockElements[0].getBoundingClientRect();
            const lastRect = blockElements[blockElements.length - 1].getBoundingClientRect();

            if (e.clientY >= lastRect.top) {
                currentId =
                    blockElements[blockElements.length - 1].getAttribute('data-block-id');
            } else if (e.clientY <= firstRect.bottom) {
                currentId = blockElements[0].getAttribute('data-block-id');
            } else {
                for (const bEl of blockElements) {
                    const rect = bEl.getBoundingClientRect();
                    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                        currentId = bEl.getAttribute('data-block-id');
                        break;
                    }
                }
                if (!currentId) {
                    let minDiff = Infinity;
                    let closest = blockElements[0];
                    for (const bEl of blockElements) {
                        const rect = bEl.getBoundingClientRect();
                        const diff = Math.abs(e.clientY - (rect.top + rect.height / 2));
                        if (diff < minDiff) {
                            minDiff = diff;
                            closest = bEl;
                        }
                    }
                    currentId = closest.getAttribute('data-block-id');
                }
            }

            if (!currentId) return;

            if (!dragStartBlockId.current) {
                dragStartBlockId.current = currentId;
            }

            if (currentId !== dragStartBlockId.current || isDraggingRange.current) {
                isDraggingRange.current = true;
                window.getSelection()?.removeAllRanges();
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }

                const startIndex = blocks.findIndex((b) => b.id === dragStartBlockId.current);
                const currentIndex = blocks.findIndex((b) => b.id === currentId);

                if (startIndex !== -1 && currentIndex !== -1) {
                    const min = Math.min(startIndex, currentIndex);
                    const max = Math.max(startIndex, currentIndex);
                    const range = blocks.slice(min, max + 1).map((b) => b.id);
                    setSelectedBlockIds(range);
                }
            }
        },
        [blocks],
    );

    useEffect(() => {
        const handlePointerUp = () => {
            dragStartBlockId.current = null;
            dragStartPos.current = null;
            isDraggingRange.current = false;
        };

        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target?.closest('[data-drag-handle="true"]')) {
                e.preventDefault();
            }
        };

        const handleDocumentDblClick = (e: MouseEvent) => {
            if (selectedBlockIds.length === 0) return;
            const target = e.target as HTMLElement | null;
            if (!target || !target.closest('[data-block="true"]')) {
                setSelectedBlockIds([]);
            }
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

        const handleWindowKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target?.tagName === 'INPUT' && !target.closest('[data-block="true"]')) {
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }
            if (
                ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
            ) {
                e.preventDefault();
                redo();
                return;
            }
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('dragstart', handleDragStart, { capture: true });
        window.addEventListener('dblclick', handleDocumentDblClick);
        window.addEventListener('keydown', handleWindowKeyDown);
        document.addEventListener('copy', handleCopy);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('dragstart', handleDragStart, { capture: true });
            window.removeEventListener('dblclick', handleDocumentDblClick);
            window.removeEventListener('keydown', handleWindowKeyDown);
            document.removeEventListener('copy', handleCopy);
        };
    }, [selectedBlockIds, blocks, handlePointerMove, undo, redo]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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

    const addBlock = useCallback(
        (type: BlockType, overId?: string, initialProperties?: Record<string, unknown>) => {
            pushSnapshot(blocks);
            isTypingRef.current = false;
            const id = crypto.randomUUID();
            setSelectedBlockIds([]);

            const defaults = getDefaultContentAndProperties(type);

            setBlocks((prev) => {
                const newBlock: FileEditorBlock = {
                    id,
                    type,
                    content: defaults.content,
                    checked: type === 'todo' ? false : undefined,
                    properties: initialProperties ?? defaults.properties,
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
        },
        [blocks, pushSnapshot],
    );

    const updateBlock = useCallback(
        (id: string, content: string, properties?: Record<string, unknown>) => {
            if (!isTypingRef.current) {
                pushSnapshot(blocks);
                isTypingRef.current = true;
            }
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
            typingTimerRef.current = setTimeout(() => {
                isTypingRef.current = false;
            }, 600);

            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === id
                        ? {
                              ...block,
                              content,
                              ...(properties !== undefined
                                  ? { properties: { ...(block.properties ?? {}), ...properties } }
                                  : {}),
                          }
                        : block,
                ),
            );
        },
        [blocks, pushSnapshot],
    );

    const updateBlockProperties = useCallback(
        (id: string, patch: Record<string, unknown>, nextContent?: string) => {
            pushSnapshot(blocks);
            isTypingRef.current = false;
            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === id
                        ? {
                              ...block,
                              content: nextContent !== undefined ? nextContent : block.content,
                              properties: {
                                  ...(block.properties ?? {}),
                                  ...patch,
                              },
                          }
                        : block,
                ),
            );
        },
        [blocks, pushSnapshot],
    );

    const convertBlock = useCallback(
        (
            id: string,
            type: BlockType,
            content?: string,
            properties?: Record<string, unknown>,
        ) => {
            pushSnapshot(blocks);
            isTypingRef.current = false;
            setSelectedBlockIds([]);
            const defaults = getDefaultContentAndProperties(type);
            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === id
                        ? {
                              ...block,
                              type,
                              content: content !== undefined ? content : defaults.content,
                              checked: type === 'todo' ? block.checked ?? false : undefined,
                              properties: properties ?? defaults.properties ?? block.properties,
                          }
                        : block,
                ),
            );
        },
        [blocks, pushSnapshot],
    );

    const handleBinaryUpload = useCallback(
        async (
            file: File,
            targetBlockId?: string,
            preferredType?: 'image' | 'file_attachment',
        ) => {
            if (!options?.onUploadFile) return;
            const resolvedType: BlockType =
                preferredType ?? (file.type.startsWith('image/') ? 'image' : 'file_attachment');

            const uploaded = await options.onUploadFile(file);

            if (targetBlockId) {
                convertBlock(targetBlockId, resolvedType, uploaded.url, {
                    attachment: uploaded.attachmentMeta,
                });
                return;
            }

            pushSnapshot(blocks);
            const id = crypto.randomUUID();
            setBlocks((prev) => [
                ...prev,
                {
                    id,
                    type: resolvedType,
                    content: uploaded.url,
                    properties: {
                        attachment: uploaded.attachmentMeta,
                    },
                },
            ]);
        },
        [options, convertBlock, pushSnapshot, blocks],
    );

    const toggleChecked = useCallback(
        (id: string) => {
            pushSnapshot(blocks);
            isTypingRef.current = false;
            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === id ? { ...block, checked: !block.checked } : block,
                ),
            );
        },
        [blocks, pushSnapshot],
    );

    const removeBlock = useCallback(
        (id: string) => {
            pushSnapshot(blocks);
            isTypingRef.current = false;
            setBlocks((prev) => prev.filter((block) => block.id !== id));
        },
        [blocks, pushSnapshot],
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) {
                return;
            }

            pushSnapshot(blocks);
            isTypingRef.current = false;
            setBlocks((prev) => {
                const oldIndex = prev.findIndex((block) => block.id === active.id);
                const newIndex = prev.findIndex((block) => block.id === over.id);
                if (oldIndex === -1 || newIndex === -1) {
                    return prev;
                }
                return arrayMove(prev, oldIndex, newIndex);
            });
        },
        [blocks, pushSnapshot],
    );

    const openInsertSelector = useCallback(
        (element: HTMLElement, blockId: string) => {
            selector.open({ element, blockId, mode: 'insert', query: '' });
        },
        [selector],
    );

    const closeSelector = useCallback(() => {
        if (selector.mode === 'convert' && selector.targetBlockId) {
            const targetId = selector.targetBlockId;
            setBlocks((prev) =>
                prev.map((block) =>
                    block.id === targetId && block.content.startsWith(BLOCK_SLASH_TRIGGER)
                        ? { ...block, content: '' }
                        : block,
                ),
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
        [selector, convertBlock, addBlock, focusBlock],
    );

    const handleBlockChange = useCallback(
        (id: string, content: string) => {
            if (content.startsWith(BLOCK_SLASH_TRIGGER)) {
                setBlocks((prev) =>
                    prev.map((block) => (block.id === id ? { ...block, content } : block)),
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
                // Smart cross-mention trigger: [[ or @
                if (content.startsWith('[[') || content === '@') {
                    convertBlock(id, 'internal_link', '', { internalLink: {} });
                    return;
                }
                // Callout trigger: > [!INFO|WARNING|DANGER|SUCCESS]
                const calloutMatch = content.match(
                    /^>\s*\[!(INFO|WARNING|DANGER|SUCCESS)\]\s*(.*)$/i,
                );
                if (calloutMatch) {
                    const calloutVariant = calloutMatch[1].toUpperCase() as CalloutVariant;
                    convertBlock(id, 'callout', calloutMatch[2], { calloutVariant });
                    return;
                }
                if (content.startsWith('```mermaid')) {
                    convertBlock(id, 'mermaid', MERMAID_PRESETS.architecture.code);
                    return;
                }
                if (content.startsWith('```openapi') || content.startsWith('```swagger')) {
                    convertBlock(id, 'openapi_spec', DEFAULT_OPENAPI_SPEC_SAMPLE);
                    return;
                }

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
                    const remaining = content.startsWith('[] ')
                        ? content.slice(3)
                        : content.slice(4);
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
        [selector, blocks, updateBlock, convertBlock, selectedBlockIds.length],
    );

    const handleBlockPaste = useCallback(
        (id: string, event: React.ClipboardEvent<HTMLElement>) => {
            // 1. Direct binary / image paste from clipboard
            const clipboardFiles = event.clipboardData?.files;
            if (clipboardFiles && clipboardFiles.length > 0 && options?.onUploadFile) {
                event.preventDefault();
                const file = clipboardFiles[0];
                if (file) {
                    const preferred = file.type.startsWith('image/')
                        ? 'image'
                        : 'file_attachment';
                    void handleBinaryUpload(file, id, preferred);
                }
                return;
            }

            // 2. Markdown text paste
            const clipboardText = event.clipboardData.getData('text/plain');
            if (!clipboardText) return;

            const hasNewlines = clipboardText.includes('\n');
            const hasMarkdownTriggers =
                /^(\s*[-*+]|\s*\d+[.)]|\s*#|\s*>|\s*```|!\[|\|.*\|)/m.test(clipboardText);

            if (!hasNewlines && !hasMarkdownTriggers) {
                return;
            }

            event.preventDefault();
            const parsed = parseMarkdownToBlocks(clipboardText);
            if (parsed.length === 0) return;

            pushSnapshot(blocks);
            isTypingRef.current = false;

            setBlocks((prev) => {
                const targetIndex = prev.findIndex((b) => b.id === id);
                if (targetIndex === -1) {
                    return prev;
                }

                const targetBlock = prev[targetIndex];
                const shouldReplace =
                    targetBlock.content.trim() === '' && targetBlock.type === 'text';

                const newBlocks: FileEditorBlock[] = parsed.map((p) => ({
                    id: crypto.randomUUID(),
                    type: p.type,
                    content: p.content,
                    checked: p.checked,
                    properties: p.properties,
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
        [blocks, pushSnapshot, options, handleBinaryUpload],
    );

    const handleBlockKeyDown = useCallback(
        (id: string, event: ReactKeyboardEvent<HTMLElement>) => {
            if (selector.isOpen) {
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
                event.preventDefault();
                undo();
                return;
            }
            if (
                ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') ||
                ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z')
            ) {
                event.preventDefault();
                redo();
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
                event.preventDefault();
                selectAllBlocks();
                return;
            }

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

            if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !['code', 'mermaid', 'openapi_spec', 'table'].includes(block.type)
            ) {
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
            undo,
            redo,
        ],
    );

    const reset = useCallback(() => {
        setBlocks([]);
        setSelectedBlockIds([]);
        historyPast.current = [];
        historyFuture.current = [];
        updateCanUndoRedo();
        inputRefs.current.clear();
        pendingFocusId.current = null;
    }, [updateCanUndoRedo]);

    return {
        blocks,
        sensors,
        collisionDetection: closestCenter,
        selector,
        addBlock,
        updateBlock,
        updateBlockProperties,
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
        handleBinaryUpload,
        isUploadingBinary: options?.isUploadingBinary,
        mentionCandidates: options?.mentionCandidates,
        workspaceUuid: options?.workspaceUuid,
        handleBlockMouseDown,
        handleBlockMouseEnter,
        handleCanvasMouseDown,
        handlePointerMove,
        undo,
        redo,
        canUndo,
        canRedo,
        setBlocksState,
        registerInput,
        focusBlock,
        reset,
    };
}
