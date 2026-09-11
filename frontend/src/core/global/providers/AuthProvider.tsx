import { useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMeService,
  useLoginService,
  useLogoutService,
} from '@features/auth/services/auth.service';
import { setUnauthorizedCallback } from '@http-interceptors/auth-refresh.interceptor';
import { AUTH_QUERY_KEYS } from '@features/auth/constants/auth.constants';
import { AuthContext } from './auth.context';
import type {
  AuthContextValue,
  AuthUser,
  LoginCredentials,
} from '@features/auth/types/auth.types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const meQuery = useMeService();
  const loginMutation = useLoginService();
  const logoutMutation = useLogoutService();

  const user = meQuery.data ?? null;

  // Handle unrecoverable 401s when token refresh fails
  useEffect(() => {
    setUnauthorizedCallback(() => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.ME, null);
    });
  }, [queryClient]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      const loggedUser = await loginMutation.mutateAsync(credentials);
      return loggedUser;
    },
    [loginMutation]
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refreshProfile = useCallback(async (): Promise<AuthUser | null> => {
    const result = await meQuery.refetch();
    return result.data ?? null;
  }, [meQuery]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: meQuery.isLoading,
      login,
      logout,
      refreshProfile,
    }),
    [user, meQuery.isLoading, login, logout, refreshProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
