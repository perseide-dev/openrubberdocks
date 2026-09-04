export interface JsonApiResource<T = Record<string, unknown>> {
  type: string;
  id: string;
  attributes: Omit<T, 'id'>;
  relationships?: Record<string, JsonApiRelationship>;
  links?: Record<string, string>;
}

export interface JsonApiRelationship {
  data: { type: string; id: string } | { type: string; id: string }[] | null;
  links?: Record<string, string>;
}

export interface JsonApiResponse<T = unknown> {
  jsonapi?: { version: string };
  data: JsonApiResource<T> | JsonApiResource<T>[] | null;
  included?: JsonApiResource<unknown>[];
  meta?: Record<string, unknown>;
  links?: Record<string, string>;
}

export interface JsonApiErrorItem {
  status?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

export interface JsonApiErrorResponse {
  errors: JsonApiErrorItem[];
  meta?: Record<string, unknown>;
}

export interface JsonApiPayload<T = Record<string, unknown>> {
  data: {
    type?: string;
    id?: string;
    attributes: T;
    relationships?: Record<string, { data: { id: string; type?: string } | { id: string; type?: string }[] | null }>;
  };
}
