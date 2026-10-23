export type BlockType =
    | 'text'
    | 'heading_1'
    | 'heading_2'
    | 'heading_3'
    | 'bullet_list'
    | 'numbered_list'
    | 'todo'
    | 'image'
    | 'code'
    | 'quote'
    | 'divider';

export interface WorkspaceBlock {
    id: string;
    uuid: string;
    fileUuid: string;
    parentBlockUuid: string | null;
    type: BlockType;
    properties: Record<string, unknown> | null;
    orderIndex: number;
    createdByUuid: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBlockPayload extends Record<string, unknown> {
    fileUuid: string;
    parentBlockUuid?: string;
    type: BlockType;
    properties?: Record<string, unknown>;
    orderIndex: number;
}

export interface UpdateBlockPayload extends Record<string, unknown> {
    properties?: Record<string, unknown>;
}

export interface UpdateBlockVariables {
    uuid: string;
    payload: UpdateBlockPayload;
}

export interface MoveBlockPayload extends Record<string, unknown> {
    newParentBlockUuid?: string;
    newOrderIndex: number;
}

export interface MoveBlockVariables {
    uuid: string;
    payload: MoveBlockPayload;
}

export interface BlockFilters {
    fileUuid?: string;
    parentBlockUuid?: string;
    type?: BlockType;
}

export interface BlockTypeOption {
    type: BlockType;
    label: string;
}

export interface FileEditorBlock {
    id: string;
    type: BlockType;
    content: string;
    checked?: boolean;
}

export type BlockSelectorMode = 'insert' | 'convert';

export interface BlockSelectorRequest {
    element: HTMLElement;
    blockId: string;
    mode: BlockSelectorMode;
    query: string;
}

export interface BlockSelectorController {
    isOpen: boolean;
    anchorEl: HTMLElement | null;
    targetBlockId: string | null;
    mode: BlockSelectorMode;
    query: string;
    open: (request: BlockSelectorRequest) => void;
    close: () => void;
    setQuery: (query: string) => void;
}

import type {
    DragEndEvent,
    SensorDescriptor,
    SensorOptions,
    CollisionDetection,
} from '@dnd-kit/core';

export interface BlockEditorController {
    blocks: FileEditorBlock[];
    sensors: SensorDescriptor<SensorOptions>[];
    collisionDetection: CollisionDetection;
    selector: BlockSelectorController;
    addBlock: (type: BlockType, overId?: string) => string;
    updateBlock: (id: string, content: string, properties?: Record<string, unknown>) => void;
    convertBlock: (id: string, type: BlockType, content?: string) => void;
    toggleChecked: (id: string) => void;
    removeBlock: (id: string) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    handleBlockChange: (id: string, content: string) => void;
    handleBlockKeyDown: (id: string, e: React.KeyboardEvent<HTMLElement>) => void;
    openInsertSelector: (element: HTMLElement, id: string) => void;
    closeSelector: () => void;
    handleSelectBlockType: (type: BlockType) => void;
    selectedBlockIds: string[];
    selectAllBlocks: () => void;
    clearBlockSelection: () => void;
    deleteSelectedBlocks: () => void;
    handleBlockPaste: (id: string, event: React.ClipboardEvent<HTMLElement>) => void;
    handleBlockMouseDown: (id: string, event: React.MouseEvent<HTMLElement>) => void;
    handleBlockMouseEnter: (id: string) => void;
    handleCanvasMouseDown: (event: React.MouseEvent<HTMLElement>) => void;
    handlePointerMove: (event: React.PointerEvent<HTMLElement> | PointerEvent | MouseEvent) => void;
    registerInput: (id: string, element: HTMLTextAreaElement | null) => void;
    focusBlock: (id: string) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    setBlocksState: (blocks: FileEditorBlock[]) => void;
    reset: () => void;
}
