import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
    WORKSPACE_ENDPOINTS,
    WORKSPACE_RESOURCE_TYPE,
} from '@features/workspaces/manager/constants/workspace.constants';
import type {
    Workspace,
    CreateWorkspacePayload,
    UpdateWorkspacePayload,
} from '@features/workspaces/manager/types/workspace.types';

/**
 * Fetches the raw workspaces list from the backend (GET /workspaces).
 */
export async function getWorkspacesRepository(): Promise<Workspace[]> {
    return baseAPIrequest.get<Workspace[]>(WORKSPACE_ENDPOINTS.BASE);
}

/**
 * Fetches a single workspace by UUID from the backend (GET /workspaces/:uuid).
 */
export async function getWorkspaceByUuidRepository(uuid: string): Promise<Workspace> {
    return baseAPIrequest.get<Workspace>(WORKSPACE_ENDPOINTS.BY_UUID(uuid));
}

/**
 * Persists a new workspace (POST /workspaces).
 */
export async function createWorkspaceRepository(
    payload: CreateWorkspacePayload
): Promise<Workspace> {
    return baseAPIrequest.post<Workspace, CreateWorkspacePayload>(
        WORKSPACE_ENDPOINTS.BASE,
        payload,
        { resourceType: WORKSPACE_RESOURCE_TYPE }
    );
}

/**
 * Updates an existing workspace (PATCH /workspaces/:uuid).
 */
export async function updateWorkspaceRepository(
    uuid: string,
    payload: UpdateWorkspacePayload
): Promise<Workspace> {
    return baseAPIrequest.patch<Workspace, UpdateWorkspacePayload>(
        WORKSPACE_ENDPOINTS.BY_UUID(uuid),
        payload,
        { resourceType: WORKSPACE_RESOURCE_TYPE }
    );
}

/**
 * Removes an existing workspace (DELETE /workspaces/:uuid).
 */
export async function deleteWorkspaceRepository(uuid: string): Promise<void> {
    return baseAPIrequest.delete<void>(WORKSPACE_ENDPOINTS.BY_UUID(uuid));
}
