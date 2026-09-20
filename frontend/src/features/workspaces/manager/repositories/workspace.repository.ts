import { baseAPIrequest } from '@http-base/baseAPIrequest';
import { WORKSPACE_ENDPOINTS } from '@features-workspaces/manager/constants/workspace.constants';
import type { AnyUseSuspenseQueryOptions } from '@tanstack/react-query';
import type { CreateWorkspacePayload } from '@features-workspaces/manager/types/workspace.types';


export async function createWorkspaceRepository(payloadCreateWorkspace: CreateWorkspacePayload): Promise<any> {
    const payload: CreateWorkspacePayload = payloadCreateWorkspace;

    return baseAPIrequest.post<AnyUseSuspenseQueryOptions>(
        WORKSPACE_ENDPOINTS.BASE,
        payload,
        {
            resourceType: 'workspaces',
        }
    );
}