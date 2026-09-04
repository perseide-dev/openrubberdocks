import type { JsonApiResource, JsonApiResponse, JsonApiPayload } from '@http-types/json-api.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a payload is already in JSON:API format.
 */
function isPreformattedJsonApiPayload(value: unknown): value is JsonApiPayload {
  if (!isRecord(value) || !('data' in value)) return false;
  const data = value.data;
  return isRecord(data) && 'attributes' in data;
}

/**
 * Wraps a standard flat object into the JSON:API specification payload expected
 * by the backend's JsonApiDeserializePipe.
 */
export function serializeToJsonApi<T extends Record<string, unknown>>(
  data: T,
  options?: {
    type?: string;
    id?: string;
    relationships?: Record<string, { data: { id: string; type?: string } | { id: string; type?: string }[] | null }>;
  }
): JsonApiPayload<Omit<T, 'id'>> {
  // If already in JSON:API format, return as-is
  if (isPreformattedJsonApiPayload(data)) {
    return data as unknown as JsonApiPayload<Omit<T, 'id'>>;
  }

  const { id: dataId, ...attributes } = data as { id?: string | number } & Record<string, unknown>;
  const resourceId =
    options?.id ??
    (typeof dataId === 'string' || typeof dataId === 'number' ? String(dataId) : undefined);

  return {
    data: {
      ...(options?.type ? { type: options.type } : {}),
      ...(resourceId ? { id: resourceId } : {}),
      attributes: attributes as Omit<T, 'id'>,
      ...(options?.relationships ? { relationships: options.relationships } : {}),
    },
  };
}

/**
 * Flattens a single JSON:API resource { id, type, attributes, relationships }
 * into a standard flat JavaScript entity { id, ...attributes }.
 */
export function flattenResource<T = Record<string, unknown>>(
  resource: JsonApiResource<T>
): T & { id: string; type: string } {
  if (!isRecord(resource)) {
    return resource as unknown as T & { id: string; type: string };
  }

  const { id, type, attributes, relationships } = resource;

  const flattened: Record<string, unknown> = {
    id,
    type,
    ...(attributes || {}),
  };

  if (relationships && isRecord(relationships)) {
    Object.keys(relationships).forEach((relKey) => {
      const relData = relationships[relKey]?.data;
      if (relData !== undefined) {
        if (Array.isArray(relData)) {
          flattened[`${relKey}Ids`] = relData.map((item) => item.id);
        } else if (relData && typeof relData === 'object') {
          flattened[`${relKey}Id`] = relData.id;
        }
      }
    });
  }

  return flattened as unknown as T & { id: string; type: string };
}

/**
 * Deserializes an entire JSON:API response payload into flat data models.
 */
export function deserializeJsonApi<T = unknown>(
  payload: unknown
): T | T[] | null {
  if (!isRecord(payload)) {
    return payload as T;
  }

  const response = payload as unknown as JsonApiResponse<T>;

  // Check if it matches JsonApiResponse structure
  if (!('data' in response)) {
    return payload as T;
  }

  if (response.data === null) {
    return null;
  }

  if (Array.isArray(response.data)) {
    return response.data.map((item) => flattenResource<T>(item)) as unknown as T[];
  }

  return flattenResource<T>(response.data) as unknown as T;
}
