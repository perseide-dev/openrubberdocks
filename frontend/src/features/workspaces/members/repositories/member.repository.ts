import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
  MEMBER_ENDPOINTS,
  MEMBER_RESOURCE_TYPE,
} from '@features-workspaces/members/constants/member.constants';
import type {
  WorkspaceMemberItem,
  AddMemberPayload,
  UpdateMemberRolePayload,
  RoleItem,
  UserSearchResult,
} from '@features-workspaces/members/types/member.types';

export async function getWorkspaceMembersRepository(
  workspaceUuid: string,
): Promise<WorkspaceMemberItem[]> {
  return baseAPIrequest.get<WorkspaceMemberItem[]>(
    MEMBER_ENDPOINTS.LIST(workspaceUuid),
  );
}

export async function addWorkspaceMemberRepository(
  workspaceUuid: string,
  payload: AddMemberPayload,
): Promise<WorkspaceMemberItem> {
  return baseAPIrequest.post<WorkspaceMemberItem, AddMemberPayload>(
    MEMBER_ENDPOINTS.ADD(workspaceUuid),
    payload,
    { resourceType: MEMBER_RESOURCE_TYPE },
  );
}

export async function updateMemberRoleRepository(
  workspaceUuid: string,
  userUuid: string,
  payload: UpdateMemberRolePayload,
): Promise<WorkspaceMemberItem> {
  return baseAPIrequest.patch<WorkspaceMemberItem, UpdateMemberRolePayload>(
    MEMBER_ENDPOINTS.UPDATE_ROLE(workspaceUuid, userUuid),
    payload,
    { resourceType: MEMBER_RESOURCE_TYPE },
  );
}

export async function removeWorkspaceMemberRepository(
  workspaceUuid: string,
  userUuid: string,
): Promise<void> {
  return baseAPIrequest.delete<void>(
    MEMBER_ENDPOINTS.REMOVE(workspaceUuid, userUuid),
  );
}

export async function getAvailableRolesRepository(): Promise<RoleItem[]> {
  return baseAPIrequest.get<RoleItem[]>(MEMBER_ENDPOINTS.ROLES);
}

export async function searchUsersRepository(
  search: string,
): Promise<UserSearchResult[]> {
  return baseAPIrequest.get<UserSearchResult[]>(
    MEMBER_ENDPOINTS.USERS_SEARCH(search),
  );
}
