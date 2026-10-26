import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// Importamos nuestras interfaces
import { JsonApiResponse, JsonApiResource } from '@commonInterface/json-api.interface';

const SENSITIVE_ATTRIBUTES = new Set([
  'password',
  'hashedRefreshToken',
  'refreshToken',
  'keyHash',
]);

@Injectable()
// Tipamos el interceptor para que reciba T y retorne JsonApiResponse<T>
export class JsonApiInterceptor<T> implements NestInterceptor<T, JsonApiResponse<T>> {
  constructor(private readonly resourceType: string) { }

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<JsonApiResponse<T>> {
    return next.handle().pipe(
      map((data: any) => {
        if (!data) return { data: null } as unknown as JsonApiResponse<T>;

        if (
          typeof data === 'object' &&
          !Array.isArray(data) &&
          (('data' in data && data.data === null) ||
            ('success' in data && Object.keys(data).length === 1))
        ) {
          return {
            jsonapi: { version: '1.0' },
            data: null,
          } as unknown as JsonApiResponse<T>;
        }

        const isArray = Array.isArray(data);
        const includedMap = new Map<string, JsonApiResource<any>>();

        const formatResource = (item: any, currentType: string): JsonApiResource<any> => {
          const { id, ...rest } = item;
          const attributes: any = {};
          const relationships: Record<string, any> = {};

          Object.keys(rest).forEach((key) => {
            if (SENSITIVE_ATTRIBUTES.has(key)) {
              return;
            }

            const value = rest[key];

            const isRelation = Array.isArray(value)
              ? value.length > 0 && value[0]?.id !== undefined
              : value && typeof value === 'object' && value.id !== undefined && !(value instanceof Date);

            if (isRelation) {
              const relType = key;

              if (Array.isArray(value)) {
                relationships[key] = {
                  data: value.map((v) => ({ type: relType, id: String(v.id ?? v.uuid) })),
                };
                value.forEach((v) => processIncluded(v, relType));
              } else {
                relationships[key] = {
                  data: { type: relType, id: String(value.id ?? value.uuid) },
                };
                processIncluded(value, relType);
              }
            } else {
              attributes[key] = value;
            }
          });

          return {
            type: currentType,
            id: String(id ?? rest.uuid),
            attributes,
            ...(Object.keys(relationships).length > 0 && { relationships }),
          };
        };

        const processIncluded = (item: any, type: string) => {
          const itemId = item.id ?? item.uuid;
          const mapKey = `${type}:${itemId}`;
          if (!includedMap.has(mapKey)) {
            // Guardamos un objeto parcial para romper el ciclo, luego lo sobreescribimos
            includedMap.set(mapKey, { type, id: String(itemId), attributes: {} });
            includedMap.set(mapKey, formatResource(item, type));
          }
        };

        const primaryData = isArray
          ? data.map((item) => formatResource(item, this.resourceType))
          : formatResource(data, this.resourceType);

        const response: JsonApiResponse<T> = {
          jsonapi: { version: '1.0' },
          data: primaryData as any,
        };

        if (includedMap.size > 0) {
          response.included = Array.from(includedMap.values());
        }

        return response;
      }),
    );
  }
}