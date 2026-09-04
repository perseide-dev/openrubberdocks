import { HTTPError } from 'ky';
import type { JsonApiErrorItem, JsonApiErrorResponse } from '@http-types/json-api.types';

export class AppError extends Error {
  public readonly status: number;
  public readonly errors: JsonApiErrorItem[];
  public readonly isNetworkError: boolean;

  constructor(options: {
    message: string;
    status?: number;
    errors?: JsonApiErrorItem[];
    isNetworkError?: boolean;
  }) {
    super(options.message);
    this.name = 'AppError';
    this.status = options.status ?? 500;
    this.errors = options.errors ?? [];
    this.isNetworkError = options.isNetworkError ?? false;

    // Preserve prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
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

    try {
      const data = (await error.response.clone().json()) as JsonApiErrorResponse;

      if (data && Array.isArray(data.errors) && data.errors.length > 0) {
        const details = data.errors
          .map((err) => err.detail || err.title)
          .filter(Boolean)
          .join(', ');

        return new AppError({
          message: details || `Request failed with status ${status}`,
          status,
          errors: data.errors,
        });
      }
    } catch {
      // Body was not JSON or failed to parse
    }

    return new AppError({
      message: error.message || `Request failed with status ${status}`,
      status,
    });
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError({
      message: 'Network error. Please check your internet connection.',
      status: 0,
      isNetworkError: true,
    });
  }

  if (error instanceof Error) {
    return new AppError({
      message: error.message,
      status: 500,
    });
  }

  return new AppError({
    message: 'An unexpected error occurred.',
    status: 500,
  });
}
