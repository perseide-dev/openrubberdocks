import { type Options } from 'ky';
import { baseAPIservice } from './baseAPIservice';
import { parseHttpError } from '@http-error/http-error.handler';
import {
  serializeToJsonApi,
  deserializeJsonApi,
} from '@http-interceptors/json-api.interceptor';

export interface BaseRequestOptions extends Omit<Options, 'json'> {
  /**
   * If true (default), automatically flattens incoming JSON:API responses.
   */
  unwrapJsonApi?: boolean;
  /**
   * If true (default), automatically wraps outgoing body in JSON:API format { data: { attributes } }.
   */
  wrapJsonApi?: boolean;
  /**
   * Type identifier to include when serializing JSON:API payload.
   */
  resourceType?: string;
}

/**
 * Standard typed API request client that abstracts Ky execution,
 * automatically formats JSON:API requests/responses, and normalizes errors.
 */
export const baseAPIrequest = {
  /**
   * Performs a GET request and deserializes the JSON:API response.
   */
  async get<TResponse>(
    endpoint: string,
    options?: BaseRequestOptions
  ): Promise<TResponse> {
    try {
      const response = await baseAPIservice.get(endpoint, options).json<unknown>();
      const unwrap = options?.unwrapJsonApi ?? true;
      return (unwrap ? deserializeJsonApi<TResponse>(response) : response) as TResponse;
    } catch (error) {
      throw await parseHttpError(error);
    }
  },

  /**
   * Performs a POST request with optional JSON:API payload wrapping.
   */
  async post<TResponse = unknown, TBody extends Record<string, unknown> = Record<string, unknown>>(
    endpoint: string,
    body?: TBody | FormData,
    options?: BaseRequestOptions
  ): Promise<TResponse> {
    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const wrap = options?.wrapJsonApi ?? true;

      let jsonPayload: unknown = body;
      if (!isFormData && body && wrap) {
        jsonPayload = serializeToJsonApi(body as Record<string, unknown>, { type: options?.resourceType });
      }

      const requestOptions: Options = {
        ...options,
        ...(isFormData ? { body } : { json: jsonPayload }),
      };

      const response = await baseAPIservice.post(endpoint, requestOptions).json<unknown>();
      const unwrap = options?.unwrapJsonApi ?? true;
      return (unwrap ? deserializeJsonApi<TResponse>(response) : response) as TResponse;
    } catch (error) {
      throw await parseHttpError(error);
    }
  },

  /**
   * Performs a PUT request with optional JSON:API payload wrapping.
   */
  async put<TResponse = unknown, TBody extends Record<string, unknown> = Record<string, unknown>>(
    endpoint: string,
    body?: TBody | FormData,
    options?: BaseRequestOptions
  ): Promise<TResponse> {
    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const wrap = options?.wrapJsonApi ?? true;

      let jsonPayload: unknown = body;
      if (!isFormData && body && wrap) {
        jsonPayload = serializeToJsonApi(body as Record<string, unknown>, { type: options?.resourceType });
      }

      const requestOptions: Options = {
        ...options,
        ...(isFormData ? { body } : { json: jsonPayload }),
      };

      const response = await baseAPIservice.put(endpoint, requestOptions).json<unknown>();
      const unwrap = options?.unwrapJsonApi ?? true;
      return (unwrap ? deserializeJsonApi<TResponse>(response) : response) as TResponse;
    } catch (error) {
      throw await parseHttpError(error);
    }
  },

  /**
   * Performs a PATCH request with optional JSON:API payload wrapping.
   */
  async patch<TResponse = unknown, TBody extends Record<string, unknown> = Record<string, unknown>>(
    endpoint: string,
    body?: TBody | FormData,
    options?: BaseRequestOptions
  ): Promise<TResponse> {
    try {
      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      const wrap = options?.wrapJsonApi ?? true;

      let jsonPayload: unknown = body;
      if (!isFormData && body && wrap) {
        jsonPayload = serializeToJsonApi(body as Record<string, unknown>, { type: options?.resourceType });
      }

      const requestOptions: Options = {
        ...options,
        ...(isFormData ? { body } : { json: jsonPayload }),
      };

      const response = await baseAPIservice.patch(endpoint, requestOptions).json<unknown>();
      const unwrap = options?.unwrapJsonApi ?? true;
      return (unwrap ? deserializeJsonApi<TResponse>(response) : response) as TResponse;
    } catch (error) {
      throw await parseHttpError(error);
    }
  },

  /**
   * Performs a DELETE request.
   */
  async delete<TResponse = void>(
    endpoint: string,
    options?: BaseRequestOptions
  ): Promise<TResponse> {
    try {
      const response = await baseAPIservice.delete(endpoint, options);

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as TResponse;
      }

      const data = await response.json<unknown>();
      const unwrap = options?.unwrapJsonApi ?? true;
      return (unwrap ? deserializeJsonApi<TResponse>(data) : data) as TResponse;
    } catch (error) {
      throw await parseHttpError(error);
    }
  },
};
