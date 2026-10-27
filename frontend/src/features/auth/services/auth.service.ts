import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loginRepository,
  getMeRepository,
  logoutRepository,
} from '@features/auth/repositories/auth.repository';
import {
  AUTH_QUERY_KEYS,
  AUTH_MUTATION_KEYS,
  AUTH_DEFAULTS,
} from '@features/auth/constants/auth.constants';
import type { AuthUser, LoginCredentials } from '@features/auth/types/auth.types';
import type { AppError } from '@http-error/http-error.handler';
import { clearAllDraftsAndTabs } from '@utils-functions/storage.utils';
import { stopGlobalRadio } from '@global-hooks/useCliampRadio';

/**
 * Service hook to query and cache the currently authenticated user.
 */
export function useMeService(enabled = true) {
  return useQuery<AuthUser, AppError>({
    queryKey: AUTH_QUERY_KEYS.ME,
    queryFn: getMeRepository,
    enabled,
    staleTime: AUTH_DEFAULTS.STALE_TIME,
    retry: false,
  });
}

/**
 * Service mutation hook to log in a user and invalidate query caches.
 */
export function useLoginService() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, AppError, LoginCredentials>({
    mutationKey: AUTH_MUTATION_KEYS.LOGIN,
    mutationFn: (credentials) => loginRepository(credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.ME, user);
    },
  });
}

/**
 * Service mutation hook to log out and purge authentication caches.
 */
export function useLogoutService() {
  const queryClient = useQueryClient();

  return useMutation<void, AppError, void>({
    mutationKey: AUTH_MUTATION_KEYS.LOGOUT,
    mutationFn: logoutRepository,
    onSuccess: () => {
      clearAllDraftsAndTabs();
      stopGlobalRadio();
      queryClient.setQueryData(AUTH_QUERY_KEYS.ME, null);
      queryClient.clear();
    },
  });
}
