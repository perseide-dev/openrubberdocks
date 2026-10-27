import { baseAPIrequest } from '@http-base/baseAPIrequest';
import { AUTH_ENDPOINTS } from '@features/auth/constants/auth.constants';
import type {
  AuthUser,
  LoginCredentials,
  LoginBackendPayload,
} from '@features/auth/types/auth.types';

/**
 * Executes raw authentication request against /auth/login.
 * Serializes payload to JSON:API { data: { type: 'users', attributes } }.
 */
export async function loginRepository(credentials: LoginCredentials): Promise<AuthUser> {
  const payload: LoginBackendPayload = {
    rubberHandle: credentials.rubberHandle,
    pwd: credentials.pwd,
  };

  return baseAPIrequest.post<AuthUser, LoginBackendPayload>(
    AUTH_ENDPOINTS.LOGIN,
    payload,
    {
      resourceType: 'users',
    }
  );
}

/**
 * Retrieves the currently authenticated user session via /auth/me.
 */
export async function getMeRepository(): Promise<AuthUser> {
  return baseAPIrequest.get<AuthUser>(AUTH_ENDPOINTS.ME);
}

/**
 * Invalidates the current user session and clears httpOnly cookies via /auth/logout.
 */
export async function logoutRepository(): Promise<void> {
  await baseAPIrequest.post<void>(AUTH_ENDPOINTS.LOGOUT);
}
