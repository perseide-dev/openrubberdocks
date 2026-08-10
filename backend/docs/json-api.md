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

Intercepta la respuesta final enviada desde el controlador hacia el cliente y la formatea según la especificación JSON:API, procesando dinámicamente las relaciones.
- Recibe el `resourceType` en su constructor para asignar correctamente la propiedad `type` del recurso principal (ej. `'users'`, `'posts'`).
- Detecta si los datos son un arreglo o un objeto singular.
- Extrae la propiedad `id` de cada objeto y ubica los campos regulares dentro de `attributes`.
- **Motor de Relaciones:** Si detecta que alguna propiedad del objeto es a su vez un objeto (o un array de objetos) que contenga un `id`, automáticamente lo mueve al bloque `relationships` con su respectivo `type` y `id`.
- **Sideloading automático:** Los objetos relacionados se añaden de forma única en el arreglo raíz `included`, previniendo ciclos de referencias o datos duplicados.
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

### 5. Decorador Personalizado de Body (`@JsonApiBody()`)
**Archivo:** `src/common/decorators/json-api-body.decorator.ts`

Un helper para simplificar los controladores. Esencialmente combina el uso de `@Body()` de NestJS junto con el `JsonApiDeserializePipe`. 

**Ejemplo de uso:**
```typescript
@Post()
create(@JsonApiBody() createDto: CreateUserDto) {
  return this.usersService.create(createDto);
}
```

### 6. Decorador Personalizado de Consultas (`@JsonApiQuery()`)
**Archivo:** `src/common/decorators/json-api-query.decorator.ts`

Se encarga de extraer y procesar los parámetros de consulta específicos de JSON:API desde la URL, como el parámetro `include`.
- Parsea el string separado por comas (ej. `?include=category,author`) transformándolo en un array de strings (ej. `['category', 'author']`).
- Permite inyectar las opciones directamente al método del controlador para pasarlas posteriormente a los servicios u ORM y resolver qué relaciones deben incluirse desde la base de datos.

**Ejemplo de uso:**
```typescript
@Get()
findAll(@JsonApiQuery() query: JsonApiQueryOptions) {
  // query.relations contendrá un array si se envía el parámetro 'include'
  return this.usersService.findAll({ relations: query.relations });
}
```

## Resumen del Flujo de Datos

1. **Entrada (Request):** 
   - En peticiones con datos (`POST`/`PATCH`), el cliente envía el JSON:API. El decorador `@JsonApiBody()` lo transforma a un DTO estándar.
   - En consultas (`GET`), el decorador `@JsonApiQuery()` lee los parámetros `include` de la URL para determinar relaciones.
2. **Procesamiento y Validación:** 
   Se usan los servicios y DTOs para la validación (con `class-validator`). Si ocurre algún fallo, el `JsonApiExceptionFilter` se asegura de estructurar el error bajo el nodo `errors`.
3. **Salida (Response):** 
   El controlador responde con un objeto normal que contiene entidades relacionadas anidadas. El `JsonApiInterceptor` toma este objeto, lo formatea agregándole `type`, separa las entidades hijas colocándolas como referencias en `relationships` e inyectándolas en la raíz bajo `included`, asegurando así un JSON 100% compatible.

## Casos de Uso del Motor de Relaciones

Al combinar el interceptor modificado (`JsonApiInterceptor`) y el extractor de queries (`@JsonApiQuery`), el backend es capaz de estructurar dinámicamente recursos complejos utilizando "Sideloading".

### Obtener un recurso e incluir sus relaciones

**Request:**
```http
GET /articles/1?include=author,comments
```

**Flujo en Controlador / Servicio:**
```typescript
@UseInterceptors(new JsonApiInterceptor('articles'))
@Get(':id')
findOne(@Param('id') id: string, @JsonApiQuery() query: JsonApiQueryOptions) {
  // Aquí le indicamos al ORM que además recupere 'author' y 'comments'
  // Esto retornará un objeto anidado normal en Javascript.
  return this.articleService.findOne(id, { relations: query.relations });
}
```

**Objeto Devuelto por el Servicio (Antes del Interceptor):**
```json
{
  "id": 1,
  "title": "Introducción a JSON:API",
  "content": "Contenido del post...",
  "author": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "comments": [
    { "id": 101, "text": "Excelente artículo" },
    { "id": 102, "text": "Me ayudó mucho" }
  ]
}
```

**Respuesta HTTP Final (Luego del Interceptor):**
```json
{
  "jsonapi": { "version": "1.0" },
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Introducción a JSON:API",
      "content": "Contenido del post..."
    },
    "relationships": {
      "author": {
        "data": { "type": "author", "id": "42" }
      },
      "comments": {
        "data": [
          { "type": "comments", "id": "101" },
          { "type": "comments", "id": "102" }
        ]
      }
    }
  },
  "included": [
    {
      "type": "author",
      "id": "42",
      "attributes": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    },
    {
      "type": "comments",
      "id": "101",
      "attributes": {
        "text": "Excelente artículo"
      }
    },
    {
      "type": "comments",
      "id": "102",
      "attributes": {
        "text": "Me ayudó mucho"
      }
    }
  ]
}
```
Como se aprecia en la respuesta, el interceptor extrae correctamente las entidades `author` y `comments` de los atributos del documento principal, y las empaqueta en `included`. Además, las enlaza mediante el uso de `relationships` dentro de `data`, garantizando el cumplimiento de la norma y evitando envío redundante de información.
