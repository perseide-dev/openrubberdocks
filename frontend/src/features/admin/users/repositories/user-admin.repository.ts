import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
  USER_ADMIN_ENDPOINTS,
  USER_ADMIN_RESOURCE_TYPE,
} from '@features/admin/users/constants/user-admin.constants';
import type {
  AdminUserItem,
  CreateUserPayload,
  UpdateUserPayload,
} from '@features/admin/users/types/user-admin.types';

export async function getAdminUsersRepository(
  search?: string,
): Promise<AdminUserItem[]> {
  return baseAPIrequest.get<AdminUserItem[]>(
    USER_ADMIN_ENDPOINTS.LIST(search),
  );
}

export async function createAdminUserRepository(
  payload: CreateUserPayload,
): Promise<AdminUserItem> {
  return baseAPIrequest.post<AdminUserItem, CreateUserPayload>(
    USER_ADMIN_ENDPOINTS.CREATE,
    payload,
    { resourceType: USER_ADMIN_RESOURCE_TYPE },
  );
}

export async function updateAdminUserRepository(
  uuid: string,
  payload: UpdateUserPayload,
): Promise<AdminUserItem> {
  return baseAPIrequest.patch<AdminUserItem, UpdateUserPayload>(
    USER_ADMIN_ENDPOINTS.USER_BY_UUID(uuid),
    payload,
    { resourceType: USER_ADMIN_RESOURCE_TYPE },
  );
}

export async function getAdminRolesRepository(): Promise<{ uuid: string; name: string }[]> {
  return baseAPIrequest.get<{ uuid: string; name: string }[]>(
    USER_ADMIN_ENDPOINTS.ROLES,
  );
}
