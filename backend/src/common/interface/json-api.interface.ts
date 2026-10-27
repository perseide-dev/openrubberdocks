export interface JsonApiResource<T> {
    type: string;
    id: string;
    attributes: Omit<T, 'id'>;
    relationships?: Record<string, any>
    links?: Record<string, string>
}

export interface JsonApiResponse<T> {
    data: JsonApiResource<T> | JsonApiResource<T>[] | null
    included?: JsonApiResource<any>[]
    meta?: Record<string, any>
    links?: Record<string, string>
    jsonapi?: { version: string }
}