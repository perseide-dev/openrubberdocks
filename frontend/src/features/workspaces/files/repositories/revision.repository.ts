import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
    REVISION_ENDPOINTS,
    REVISION_RESOURCE_TYPE,
} from '@features-workspaces/files/constants/revision.constants';
import type { FileRevision } from '@features-workspaces/files/types/revision.types';
import type { WorkspaceFile } from '@features-workspaces/files/types/file.types';

/**
 * Fetches all revision checkpoints for a specific file (GET /files/:uuid/revisions).
 */
export async function getFileRevisionsRepository(fileUuid: string): Promise<FileRevision[]> {
    return baseAPIrequest.get<FileRevision[]>(REVISION_ENDPOINTS.BASE(fileUuid));
}

/**
 * Fetches a single revision checkpoint (GET /files/:uuid/revisions/:revisionUuid).
 */
export async function getFileRevisionByUuidRepository(
    fileUuid: string,
    revisionUuid: string,
): Promise<FileRevision> {
    return baseAPIrequest.get<FileRevision>(REVISION_ENDPOINTS.BY_UUID(fileUuid, revisionUuid));
}

/**
 * Manually captures a snapshot checkpoint for a file (POST /files/:uuid/revisions).
 */
export async function createFileRevisionSnapshotRepository(
    fileUuid: string,
): Promise<FileRevision> {
    return baseAPIrequest.post<FileRevision>(
        REVISION_ENDPOINTS.BASE(fileUuid),
        undefined,
        { wrapJsonApi: false, resourceType: REVISION_RESOURCE_TYPE },
    );
}

/**
 * Restores a file to a specific revision checkpoint (POST /files/:uuid/revisions/:revisionUuid/restore).
 */
export async function restoreFileRevisionRepository(
    fileUuid: string,
    revisionUuid: string,
    workspaceUuid?: string,
): Promise<WorkspaceFile> {
    const endpoint = workspaceUuid
        ? `${REVISION_ENDPOINTS.RESTORE(fileUuid, revisionUuid)}?workspaceUuid=${workspaceUuid}`
        : REVISION_ENDPOINTS.RESTORE(fileUuid, revisionUuid);

    return baseAPIrequest.post<WorkspaceFile>(
        endpoint,
        undefined,
        { wrapJsonApi: false },
    );
}
