import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
    FILE_ENDPOINTS,
    FILE_RESOURCE_TYPE,
} from '@features/workspaces/files/constants/file.constants';
import type {
    WorkspaceFile,
    CreateFilePayload,
    UpdateFilePayload,
} from '@features/workspaces/files/types/file.types';

import type { FileFilters } from '@features/workspaces/files/types/file.types';

/**
 * Fetches the raw files list from the backend (GET /pages).
 */
export async function getFilesRepository(filters?: FileFilters): Promise<WorkspaceFile[]> {
    return baseAPIrequest.get<WorkspaceFile[]>(FILE_ENDPOINTS.BASE, {
        params: filters,
    });
}


/**
 * Fetches a single file by UUID from the backend (GET /pages/:uuid).
 */
export async function getFileByUuidRepository(uuid: string): Promise<WorkspaceFile> {
    return baseAPIrequest.get<WorkspaceFile>(FILE_ENDPOINTS.BY_UUID(uuid));
}

/**
 * Persists a new file (POST /pages).
 */
export async function createFileRepository(
    payload: CreateFilePayload
): Promise<WorkspaceFile> {
    return baseAPIrequest.post<WorkspaceFile, CreateFilePayload>(
        FILE_ENDPOINTS.BASE,
        payload,
        { resourceType: FILE_RESOURCE_TYPE }
    );
}

/**
 * Updates an existing file (PATCH /pages/:uuid).
 */
export async function updateFileRepository(
    uuid: string,
    payload: UpdateFilePayload
): Promise<WorkspaceFile> {
    return baseAPIrequest.patch<WorkspaceFile, UpdateFilePayload>(
        FILE_ENDPOINTS.BY_UUID(uuid),
        payload,
        { resourceType: FILE_RESOURCE_TYPE }
    );
}

/**
 * Removes an existing file (DELETE /pages/:uuid).
 */
export async function deleteFileRepository(uuid: string): Promise<void> {
    return baseAPIrequest.delete<void>(FILE_ENDPOINTS.BY_UUID(uuid));
}
