export const AUTH_ERRORS_CONSTANTS = {
  INVALID_CREDENTIALS: (): string => 'Incorrect username or password',
  ACCESS_DENIED: (): string => 'Access Denied',
  UNAUTHORIZED_ACCESS: (): string => 'Unauthorized Access',
  INVALID_API_KEY: (): string => 'Invalid or inactive API key',
  EXPIRED_API_KEY: (): string => 'API key has expired',
  API_KEY_NOT_FOUND: (): string => 'API key not found',
};
