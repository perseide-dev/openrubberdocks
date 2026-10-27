import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApiKeysRepository,
  createApiKeyRepository,
  revokeApiKeyRepository,
  deleteApiKeyRepository,
} from '@features/admin/api-keys/repositories/api-keys.repository';
import { API_KEYS_QUERY_KEYS } from '@features/admin/api-keys/constants/api-keys.constants';
import type { CreateApiKeyPayload } from '@features/admin/api-keys/types/api-keys.types';

export function useApiKeysService() {
  return useQuery({
    queryKey: API_KEYS_QUERY_KEYS.ALL,
    queryFn: getApiKeysRepository,
  });
}

export function useCreateApiKeyService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApiKeyPayload) =>
      createApiKeyRepository(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: API_KEYS_QUERY_KEYS.ALL,
      });
    },
  });
}

export function useRevokeApiKeyService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => revokeApiKeyRepository(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: API_KEYS_QUERY_KEYS.ALL,
      });
    },
  });
}

export function useDeleteApiKeyService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => deleteApiKeyRepository(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: API_KEYS_QUERY_KEYS.ALL,
      });
    },
  });
}
