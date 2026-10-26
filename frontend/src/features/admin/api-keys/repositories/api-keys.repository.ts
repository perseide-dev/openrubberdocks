import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
  API_KEYS_ENDPOINTS,
  API_KEYS_RESOURCE_TYPE,
} from '@features/admin/api-keys/constants/api-keys.constants';
import type {
  ApiKeyItem,
  CreateApiKeyPayload,
} from '@features/admin/api-keys/types/api-keys.types';

export async function getApiKeysRepository(): Promise<ApiKeyItem[]> {
  return baseAPIrequest.get<ApiKeyItem[]>(API_KEYS_ENDPOINTS.LIST);
}

export async function createApiKeyRepository(
  payload: CreateApiKeyPayload,
): Promise<ApiKeyItem> {
  return baseAPIrequest.post<ApiKeyItem, CreateApiKeyPayload>(
    API_KEYS_ENDPOINTS.CREATE,
    payload,
    { resourceType: API_KEYS_RESOURCE_TYPE },
  );
}

export async function revokeApiKeyRepository(uuid: string): Promise<ApiKeyItem> {
  return baseAPIrequest.patch<ApiKeyItem, Record<string, unknown>>(
    API_KEYS_ENDPOINTS.REVOKE(uuid),
    {},
    { resourceType: API_KEYS_RESOURCE_TYPE },
  );
}

export async function deleteApiKeyRepository(
  uuid: string,
): Promise<{ success: boolean }> {
  return baseAPIrequest.delete<{ success: boolean }>(
    API_KEYS_ENDPOINTS.DELETE(uuid),
  );
}
