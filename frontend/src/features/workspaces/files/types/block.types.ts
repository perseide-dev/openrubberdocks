import type {
    DragEndEvent,
    SensorDescriptor,
    SensorOptions,
    CollisionDetection,
} from '@dnd-kit/core';
import type {
    InternalLinkCandidate,
    InternalLinkTargetType,
} from '@features-workspaces/files/types/storage.types';

export type BlockType =
    | 'text'
    | 'heading_1'
    | 'heading_2'
    | 'heading_3'
    | 'bullet_list'
    | 'numbered_list'
    | 'todo'
    | 'image'
    | 'file_attachment'
    | 'table'
    | 'callout'
    | 'mermaid'
    | 'openapi_spec'
    | 'internal_link'
    | 'code'
    | 'quote'
    | 'divider';

export type CalloutVariant = 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS';

export interface TableBlockData {
    headers: string[];
    rows: string[][];
}

export interface AttachmentBlockMeta {
    attachmentUuid?: string;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    url?: string;
    caption?: string;
}

export interface InternalLinkBlockMeta {
    targetType?: InternalLinkTargetType;
    targetUuid?: string;
    targetTitle?: string;
    projectUuid?: string;
    subtitle?: string;
}

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

export interface SyncBlockItemPayload extends Record<string, unknown> {
    type: BlockType;
    properties?: Record<string, unknown>;
    orderIndex?: number;
    parentBlockUuid?: string;
}

export interface SyncBlocksPayload extends Record<string, unknown> {
    blocks: SyncBlockItemPayload[];
}

export interface SyncFileBlocksVariables {
    fileUuid: string;
    payload: SyncBlocksPayload;
}

export interface ParsedBlock {
    type: BlockType;
    content: string;
    checked?: boolean;
    properties?: Record<string, unknown>;
}

export interface BlockProperties {
    text?: unknown;
    checked?: unknown;
    calloutVariant?: CalloutVariant;
    calloutTitle?: string;
    table?: TableBlockData;
    attachment?: AttachmentBlockMeta;
    internalLink?: InternalLinkBlockMeta;
    specFormat?: 'yaml' | 'json';
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
    properties?: Record<string, unknown>;
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

export interface BlockEditorController {
    blocks: FileEditorBlock[];
    sensors: SensorDescriptor<SensorOptions>[];
    collisionDetection: CollisionDetection;
    selector: BlockSelectorController;
    addBlock: (type: BlockType, overId?: string, initialProperties?: Record<string, unknown>) => string;
    updateBlock: (id: string, content: string, properties?: Record<string, unknown>) => void;
    updateBlockProperties: (
        id: string,
        patch: Record<string, unknown>,
        nextContent?: string,
    ) => void;
    convertBlock: (
        id: string,
        type: BlockType,
        content?: string,
        properties?: Record<string, unknown>,
    ) => void;
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
    handleBinaryUpload?: (
        file: File,
        targetBlockId?: string,
        preferredType?: 'image' | 'file_attachment',
    ) => Promise<void>;
    isUploadingBinary?: boolean;
    mentionCandidates?: InternalLinkCandidate[];
    workspaceUuid?: string;
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

export interface BlockContentProps {
    block: FileEditorBlock;
    number?: number;
    inputRef: (element: HTMLTextAreaElement | null) => void;
    onChange: (content: string) => void;
    onUpdateProperties?: (patch: Record<string, unknown>, nextContent?: string) => void;
    onUploadBinary?: (file: File, preferredType?: 'image' | 'file_attachment') => Promise<void>;
    isUploadingBinary?: boolean;
    mentionCandidates?: InternalLinkCandidate[];
    workspaceUuid?: string;
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onPaste?: (event: React.ClipboardEvent<HTMLElement>) => void;
    onToggleChecked: () => void;
}

export interface BlockEditorProps {
    blockEditor: BlockEditorController;
}

export interface BlockTypeMenuProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    query: string;
    onQueryChange: (query: string) => void;
    onSelect: (type: BlockType) => void;
    onClose: () => void;
}

export interface SortableBlockProps {
    block: FileEditorBlock;
    number?: number;
    isSelected?: boolean;
    onChange: (id: string, content: string) => void;
    onUpdateProperties?: (
        id: string,
        patch: Record<string, unknown>,
        nextContent?: string,
    ) => void;
    onUploadBinary?: (
        id: string,
        file: File,
        preferredType?: 'image' | 'file_attachment',
    ) => Promise<void>;
    isUploadingBinary?: boolean;
    mentionCandidates?: InternalLinkCandidate[];
    workspaceUuid?: string;
    onKeyDown: (id: string, event: React.KeyboardEvent<HTMLElement>) => void;
    onPaste?: (id: string, event: React.ClipboardEvent<HTMLElement>) => void;
    onMouseDown?: (id: string, event: React.MouseEvent<HTMLElement>) => void;
    onPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
    onMouseEnter?: (id: string) => void;
    onRemove: (id: string) => void;
    onToggleChecked: (id: string) => void;
    onInsert: (element: HTMLElement, blockId: string) => void;
    registerInput: (id: string, element: HTMLTextAreaElement | null) => void;
}

export interface ParsedOpenApiParameter {
    name: string;
    in: string;
    required: boolean;
    type: string;
    description: string;
}

export interface ParsedOpenApiResponse {
    statusCode: string;
    description: string;
    contentType?: string;
    schemaPreview?: string;
}

export interface ParsedOpenApiEndpoint {
    id: string;
    method: string;
    path: string;
    summary: string;
    description: string;
    tags: string[];
    parameters: ParsedOpenApiParameter[];
    requestBodyPreview?: string;
    responses: ParsedOpenApiResponse[];
}

export interface ParsedOpenApiSpec {
    title: string;
    version: string;
    description: string;
    servers: string[];
    endpoints: ParsedOpenApiEndpoint[];
}

export interface RichBlockSharedProps {
    block: FileEditorBlock;
    readOnly?: boolean;
    workspaceUuid?: string;
    mentionCandidates?: InternalLinkCandidate[];
    isUploadingBinary?: boolean;
    onChangeContent?: (content: string) => void;
    onUpdateProperties?: (patch: Record<string, unknown>, nextContent?: string) => void;
    onUploadBinary?: (file: File, preferredType?: 'image' | 'file_attachment') => Promise<void>;
}

export interface UploadedBinaryDescriptor {
    url: string;
    attachmentMeta: AttachmentBlockMeta;
}

export interface UseBlockEditorOptions {
    workspaceUuid?: string;
    mentionCandidates?: InternalLinkCandidate[];
    isUploadingBinary?: boolean;
    onUploadFile?: (file: File) => Promise<UploadedBinaryDescriptor>;
}
