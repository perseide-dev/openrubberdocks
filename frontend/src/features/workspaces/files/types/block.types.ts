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
}
