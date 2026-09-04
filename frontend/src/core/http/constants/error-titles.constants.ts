export const HTTP_ERROR_TITLES = {
  VALIDATION_ERROR: 'Validation Error',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  BAD_REQUEST: 'Bad Request',
  CONFLICT: 'Conflict',
  UNPROCESSABLE_ENTITY: 'Unprocessable Entity',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  NETWORK_ERROR: 'Network Error',
  TIMEOUT_ERROR: 'Timeout Error',
  UNKNOWN_ERROR: 'Unknown Error',
} as const;

export type HttpErrorTitle = typeof HTTP_ERROR_TITLES[keyof typeof HTTP_ERROR_TITLES];
