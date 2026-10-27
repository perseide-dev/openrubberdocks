import ky, { type KyInstance } from 'ky';
import { env } from '@config-env';
import { authRefreshInterceptor } from '@http-interceptors/auth-refresh.interceptor';

/**
 * Base Ky instance configured with root prefix, credentials for cookies,
 * timeout defaults, and auth refresh interception.
 */
export const baseAPIservice: KyInstance = ky.create({
  prefix: env.API_URL,
  credentials: 'include',
  timeout: 30000,
  headers: {
    Accept: 'application/vnd.api+json, application/json',
  },
  retry: {
    limit: 2,
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    afterResponse: [authRefreshInterceptor],
  },
});
