import type { JsonApiResource, JsonApiResponse, JsonApiPayload } from '@http-types/json-api.types';

/**
 * Wraps a standard flat object into the JSON:API specification payload expected
 * by the backend's JsonApiDeserializePipe.
 */
export function serializeToJsonApi<T extends Record<string, unknown>>(
  data: T,
  options?: { type?: string; id?: string; relationships?: Record<string, unknown> }
): JsonApiPayload<Omit<T, 'id'>> {
  // If already in JSON:API format, pass through
  if (data && typeof data === 'object' && 'data' in data && 'attributes' in (data as any).data) {
    return data as unknown as JsonApiPayload<Omit<T, 'id'>>;
  }

  const { id: dataId, ...attributes } = data as { id?: string } & Record<string, unknown>;
  const resourceId = options?.id ?? (typeof dataId === 'string' || typeof dataId === 'number' ? String(dataId) : undefined);

  return {
    data: {
      ...(options?.type ? { type: options.type } : {}),
      ...(resourceId ? { id: resourceId } : {}),
      attributes: attributes as Omit<T, 'id'>,
      ...(options?.relationships ? { relationships: options.relationships as any } : {}),
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
  if (!resource || typeof resource !== 'object') {
    return resource as any;
  }

  const { id, type, attributes, relationships } = resource;

  const flattened: any = {
    id,
    type,
    ...(attributes || {}),
  };

  if (relationships && typeof relationships === 'object') {
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

  return flattened;
}

/**
 * Deserializes an entire JSON:API response payload into flat data models.
 */
export function deserializeJsonApi<T = unknown>(
  payload: unknown
): T | T[] | null {
  if (!payload || typeof payload !== 'object') {
    return payload as T;
  }

  const response = payload as JsonApiResponse<any>;

  // Check if it matches JsonApiResponse structure
  if (!('data' in response)) {
    return payload as T;
  }

  if (response.data === null) {
    return null;
  }

  if (Array.isArray(response.data)) {
    return response.data.map((item) => flattenResource(item)) as unknown as T[];
  }

  return flattenResource(response.data) as unknown as T;
}
