# Implementación de JSON:API

Esta documentación describe cómo está implementado el estándar [JSON:API](https://jsonapi.org/) en el backend del proyecto. El objetivo es garantizar que todas las peticiones, respuestas y errores sigan una estructura coherente a través del uso de herramientas nativas de NestJS (Interfaces, Interceptores, Filtros, Pipes y Decoradores).

## Componentes

### 1. Interfaces
**Archivo:** `src/common/interface/json-api.interface.ts`

Definen los tipos de datos principales para asegurar el cumplimiento del tipado estricto en las respuestas de la aplicación.
- `JsonApiResource<T>`: Define la estructura de un recurso individual. Incluye las propiedades `type`, `id` y agrupa el resto de campos en `attributes`. Puede incluir `relationships` y `links`.
- `JsonApiResponse<T>`: Define el envoltorio principal de la respuesta que contiene el nodo `data` (que puede ser un recurso, un array de recursos o `null`), junto con metadatos opcionales como `included`, `meta`, `links` y la versión de `jsonapi`.

### 2. Interceptor de Respuestas (`JsonApiInterceptor`)
**Archivo:** `src/common/interceptors/json-api.interceptor.ts`

Intercepta la respuesta final enviada desde el controlador hacia el cliente y la formatea según la especificación JSON:API.
- Recibe el `resourceType` en su constructor para asignar correctamente la propiedad `type` del recurso (ej. `'users'`, `'posts'`).
- Detecta si los datos son un arreglo o un objeto singular.
- Extrae la propiedad `id` de cada objeto y ubica el resto de los datos dentro del objeto `attributes`.
- Maneja correctamente respuestas vacías (útil para operaciones como `DELETE`) retornando `{ data: null }`.

**Ejemplo de uso:**
```typescript
@UseInterceptors(new JsonApiInterceptor('users'))
@Get()
findAll() {
  return this.usersService.findAll();
}
```

### 3. Filtro de Excepciones (`JsonApiExceptionFilter`)
**Archivo:** `src/common/exceptions/json-api-exception.filter.ts`

Se encarga de atrapar las excepciones no manejadas y las de tipo HTTP, transformándolas al estándar JSON:API en la propiedad `errors`.
- Genera respuestas que contienen un arreglo de errores con las propiedades `status`, `title` y `detail`.
- Tiene una integración especial con `class-validator`: si ocurren varios errores de validación, los extrae y mapea individualmente para que el cliente reciba el detalle exacto de los campos que fallaron.
- Está configurado de forma global en `main.ts` (`app.useGlobalFilters(...)`).

### 4. Pipe de Deserialización (`JsonApiDeserializePipe`)
**Archivo:** `src/common/pipes/json-api-deserialize.pipe.ts`

Se encarga de recibir el payload del cliente (que viene en formato JSON:API) y "aplanarlo" o convertirlo en un DTO convencional para que el backend trabaje de forma cómoda.
- Valida que la carga útil tenga la estructura básica (`data` y `data.attributes`).
- Extrae `id` y `attributes` reconstruyendo el objeto original.
- Lanza excepciones tipo `BadRequestException` (que luego son procesadas por el filtro) si la estructura no es correcta.

### 5. Decorador Personalizado (`@JsonApiBody()`)
**Archivo:** `src/common/decorators/json-api-body.decorator.ts`

Un helper para simplificar los controladores. Esencialmente combina el uso de `@Body()` de NestJS junto con el `JsonApiDeserializePipe`. 

**Ejemplo de uso:**
```typescript
@Post()
create(@JsonApiBody() createDto: CreateUserDto) {
  // Aquí createDto ya está formateado como un objeto estándar
  return this.usersService.create(createDto);
}
```

## Resumen del Flujo de Datos

1. **Entrada (Request):** 
   El cliente envía información estructurada con JSON:API. En el endpoint usamos el decorador `@JsonApiBody()`, el cual procesa los datos entrantes mediante el `JsonApiDeserializePipe` para entregar un objeto/DTO tradicional de NestJS al controlador.
2. **Procesamiento y Validación:** 
   Se usan los servicios para la lógica de negocio y los DTOs para la validación con `class-validator`. Si alguna validación o proceso falla, el `JsonApiExceptionFilter` se asegura de estructurar el error devuelto bajo el nodo `errors` de JSON:API.
3. **Salida (Response):** 
   El controlador responde con un objeto/array tradicional. Finalmente, la respuesta pasa a través del `JsonApiInterceptor`, el cual empaqueta los datos agregándoles `type`, separando el `id` y agrupando el resto bajo `attributes`, enviando así un JSON 100% compatible con el estándar.
