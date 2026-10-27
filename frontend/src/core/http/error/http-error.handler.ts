import { HTTPError } from 'ky';
import type { JsonApiErrorItem, JsonApiErrorResponse } from '@http-types/json-api.types';
import { HTTP_STATUS } from '@http-constants/http-status.constants';
import { HTTP_ERROR_TITLES, type HttpErrorTitle } from '@http-constants/error-titles.constants';

export class AppError extends Error {
  public readonly title: HttpErrorTitle | string;
  public readonly status: number;
  public readonly errors: JsonApiErrorItem[];
  public readonly isNetworkError: boolean;

  constructor(options: {
    message: string;
    title?: HttpErrorTitle | string;
    status?: number;
    errors?: JsonApiErrorItem[];
    isNetworkError?: boolean;
  }) {
    super(options.message);
    this.name = 'AppError';
    this.title = options.title ?? HTTP_ERROR_TITLES.UNKNOWN_ERROR;
    this.status = options.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    this.errors = options.errors ?? [];
    this.isNetworkError = options.isNetworkError ?? false;

    // Preserve prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Resolves an HTTP status code to an appropriate title constant.
 */
function resolveTitleByStatus(status: number): HttpErrorTitle {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return HTTP_ERROR_TITLES.BAD_REQUEST;
    case HTTP_STATUS.UNAUTHORIZED:
      return HTTP_ERROR_TITLES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return HTTP_ERROR_TITLES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return HTTP_ERROR_TITLES.NOT_FOUND;
    case HTTP_STATUS.CONFLICT:
      return HTTP_ERROR_TITLES.CONFLICT;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return HTTP_ERROR_TITLES.UNPROCESSABLE_ENTITY;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return HTTP_ERROR_TITLES.INTERNAL_SERVER_ERROR;
    default:
      return HTTP_ERROR_TITLES.UNKNOWN_ERROR;
  }
}

/**
 * Parses any unknown error (specifically ky HTTPError or Network failures)
 * and normalizes it into a consistent AppError structure compatible with JSON:API.
 */
export async function parseHttpError(error: unknown): Promise<AppError> {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof HTTPError) {
    const status = error.response.status;
    let title: HttpErrorTitle | string = resolveTitleByStatus(status);

    try {
      const data = (await error.response.clone().json()) as JsonApiErrorResponse;

      if (data && Array.isArray(data.errors) && data.errors.length > 0) {
        const firstError = data.errors[0];
        if (firstError?.title) {
          title = firstError.title;
        }

        const details = data.errors
          .map((err) => err.detail || err.title)
          .filter(Boolean)
          .join(', ');

        return new AppError({
          title,
          message: details || `Request failed with status ${status}`,
          status,
          errors: data.errors,
        });
      }
    } catch {
      // Response body was not valid JSON
    }

    return new AppError({
      title,
      message: error.message || `Request failed with status ${status}`,
      status,
    });
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError({
      title: HTTP_ERROR_TITLES.NETWORK_ERROR,
      message: 'Network error. Please check your internet connection.',
      status: 0,
      isNetworkError: true,
    });
  }

  if (error instanceof Error) {
    return new AppError({
      title: HTTP_ERROR_TITLES.UNKNOWN_ERROR,
      message: error.message,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }

  return new AppError({
    title: HTTP_ERROR_TITLES.UNKNOWN_ERROR,
    message: 'An unexpected error occurred.',
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  });
}
