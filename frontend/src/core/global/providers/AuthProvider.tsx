import { useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMeService,
  useLoginService,
  useLogoutService,
} from '@features/auth/services/auth.service';
import { setUnauthorizedCallback } from '@http-interceptors/auth-refresh.interceptor';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth.constants';
import { AuthContext } from '@global-providers/auth.context';
import type {
  AuthContextValue,
  AuthProviderProps,
  AuthUser,
  LoginCredentials,
} from '@features/auth/types/auth.types';

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const { data: meData, isLoading: isMeLoading, refetch: refetchMe } = useMeService();
  const { mutateAsync: loginMutateAsync } = useLoginService();
  const { mutateAsync: logoutMutateAsync } = useLogoutService();

  const user = meData ?? null;

  // Handle unrecoverable 401s when token refresh fails
  useEffect(() => {
    setUnauthorizedCallback(() => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.ME, null);
    });
  }, [queryClient]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      const loggedUser = await loginMutateAsync(credentials);
      return loggedUser;
    },
    [loginMutateAsync]
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutateAsync();
  }, [logoutMutateAsync]);

  const refreshProfile = useCallback(async (): Promise<AuthUser | null> => {
    const result = await refetchMe();
    return result.data ?? null;
  }, [refetchMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: isMeLoading,
      login,
      logout,
      refreshProfile,
    }),
    [user, isMeLoading, login, logout, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
