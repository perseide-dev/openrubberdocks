import ky, { type AfterResponseHook } from 'ky';
import { env } from '@config-env';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Callback for logout or redirection when session expiration is unrecoverable
let unauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedCallback(callback: () => void) {
  unauthorizedCallback = callback;
}

/**
 * Executes or awaits a token refresh call to /auth/refresh.
 * Prevents multiple simultaneous refresh calls using a shared Promise lock.
 */
export async function executeTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${env.API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Ky afterResponse hook that intercepts 401 Unauthorized errors,
 * triggers silent cookie rotation via /auth/refresh, and forces a transparent retry of the request.
 */
export const authRefreshInterceptor: AfterResponseHook = async ({ request, response, retryCount }) => {
  if (response.status === 401 && retryCount === 0) {
    const url = request.url;

    // Do not attempt refresh on auth endpoints to prevent infinite recursion
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      return response;
    }

    const refreshed = await executeTokenRefresh();

    if (refreshed) {
      return ky.retry();
    }

    // Refresh failed: notify listeners
    if (unauthorizedCallback) {
      unauthorizedCallback();
    }
  }

  return response;
};
