import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
  ROLE_ADMIN_ENDPOINTS,
  ROLE_ADMIN_RESOURCE_TYPE,
} from '@features/admin/roles/constants/role-admin.constants';
import type {
  AdminRoleItem,
  AdminPermissionItem,
  CreateRolePayload,
  UpdateRolePayload,
} from '@features/admin/roles/types/role-admin.types';

export async function getAdminRolesRepository(): Promise<AdminRoleItem[]> {
  return baseAPIrequest.get<AdminRoleItem[]>(ROLE_ADMIN_ENDPOINTS.ROLES);
}

export async function getAdminPermissionsRepository(): Promise<AdminPermissionItem[]> {
  return baseAPIrequest.get<AdminPermissionItem[]>(ROLE_ADMIN_ENDPOINTS.PERMISSIONS);
}

export async function createAdminRoleRepository(
  payload: CreateRolePayload,
): Promise<AdminRoleItem> {
  return baseAPIrequest.post<AdminRoleItem, CreateRolePayload>(
    ROLE_ADMIN_ENDPOINTS.ROLES,
    payload,
    { resourceType: ROLE_ADMIN_RESOURCE_TYPE },
  );
}

export async function updateAdminRoleRepository(
  uuid: string,
  payload: UpdateRolePayload,
): Promise<AdminRoleItem> {
  return baseAPIrequest.patch<AdminRoleItem, UpdateRolePayload>(
    ROLE_ADMIN_ENDPOINTS.ROLE_BY_UUID(uuid),
    payload,
    { resourceType: ROLE_ADMIN_RESOURCE_TYPE },
  );
}

export async function deleteAdminRoleRepository(uuid: string): Promise<void> {
  return baseAPIrequest.delete<void>(ROLE_ADMIN_ENDPOINTS.ROLE_BY_UUID(uuid));
}
