import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
    BLOCK_ENDPOINTS,
    BLOCK_RESOURCE_TYPE,
} from '@features/workspaces/files/constants/block.constants';
import type {
    WorkspaceBlock,
    CreateBlockPayload,
    UpdateBlockPayload,
    MoveBlockPayload,
} from '@features/workspaces/files/types/block.types';

/**
 * Fetches the raw blocks list from the backend (GET /blocks).
 */
export async function getBlocksRepository(): Promise<WorkspaceBlock[]> {
    return baseAPIrequest.get<WorkspaceBlock[]>(BLOCK_ENDPOINTS.BASE);
}

/**
 * Fetches a single block by UUID from the backend (GET /blocks/:uuid).
 */
export async function getBlockByUuidRepository(uuid: string): Promise<WorkspaceBlock> {
    return baseAPIrequest.get<WorkspaceBlock>(BLOCK_ENDPOINTS.BY_UUID(uuid));
}

/**
 * Persists a new block (POST /blocks).
 */
export async function createBlockRepository(
    payload: CreateBlockPayload
): Promise<WorkspaceBlock> {
    return baseAPIrequest.post<WorkspaceBlock, CreateBlockPayload>(
        BLOCK_ENDPOINTS.BASE,
        payload,
        { resourceType: BLOCK_RESOURCE_TYPE }
    );
}

/**
 * Updates an existing block (PATCH /blocks/:uuid).
 */
export async function updateBlockRepository(
    uuid: string,
    payload: UpdateBlockPayload
): Promise<WorkspaceBlock> {
    return baseAPIrequest.patch<WorkspaceBlock, UpdateBlockPayload>(
        BLOCK_ENDPOINTS.BY_UUID(uuid),
        payload,
        { resourceType: BLOCK_RESOURCE_TYPE }
    );
}

/**
 * Repositions an existing block (PATCH /blocks/:uuid/move).
 */
export async function moveBlockRepository(
    uuid: string,
    payload: MoveBlockPayload
): Promise<WorkspaceBlock> {
    return baseAPIrequest.patch<WorkspaceBlock, MoveBlockPayload>(
        BLOCK_ENDPOINTS.MOVE(uuid),
        payload,
        { resourceType: BLOCK_RESOURCE_TYPE }
    );
}

/**
 * Removes an existing block (DELETE /blocks/:uuid).
 */
export async function deleteBlockRepository(uuid: string): Promise<void> {
    return baseAPIrequest.delete<void>(BLOCK_ENDPOINTS.BY_UUID(uuid));
}
