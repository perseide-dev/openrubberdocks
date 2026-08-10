import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonApiResponse } from '@common/interface/json-api.interface';

@Injectable()
export class JsonApiInterceptor implements NestInterceptor {
  // Recibimos el 'type' del recurso (ej. 'users', 'posts') al instanciar el interceptor
  constructor(private readonly resourceType: string) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<JsonApiResponse<any>> {
    return next.handle().pipe(
      map((data) => {
        // Si no hay datos (ej. un DELETE), retornamos vacío o meta
        if (!data) return { data: null };

        const isArray = Array.isArray(data);
        const formatResource = (item: any) => {
          // Extraemos el ID y dejamos el resto como atributos
          const { id, ...attributes } = item;
          return {
            type: this.resourceType,
            id: String(id),
            attributes,
          };
        };

        return {
          jsonapi: { version: '1.0' },
          data: isArray ? data.map(formatResource) : formatResource(data),
        };
      }),
    );
  }
}