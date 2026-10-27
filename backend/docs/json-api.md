# JSON:API Implementation

This documentation describes how the [JSON:API](https://jsonapi.org/) standard is implemented in the project's backend. The goal is to ensure that all requests, responses, and errors follow a coherent structure using native NestJS tools (Interfaces, Interceptors, Filters, Pipes, and Decorators).

## Components

### 1. Interfaces
**File:** `src/common/interface/json-api.interface.ts`

These define the main data types to ensure strict typing in the application's responses.
- `JsonApiResource<T>`: Defines the structure of an individual resource. It includes the `type` and `id` properties and groups the rest of the fields inside `attributes`. It can also include `relationships` and `links`.
- `JsonApiResponse<T>`: Defines the main response wrapper containing the `data` node (which can be a single resource, an array of resources, or `null`), along with optional metadata like `included`, `meta`, `links`, and the `jsonapi` version.

### 2. Response Interceptor (`JsonApiInterceptor`)
**File:** `src/common/interceptors/json-api.interceptor.ts`

Intercepts the final response sent from the controller to the client and formats it according to the JSON:API specification, processing relationships dynamically.
- Receives the `resourceType` in its constructor to correctly assign the `type` property of the main resource (e.g., `'users'`, `'posts'`).
- Detects if the data is an array or a single object.
- Extracts the `id` property of each object and places the regular fields inside `attributes`.
- **Relations Engine:** If it detects that any property of the object is in turn an object (or an array of objects) containing an `id`, it automatically moves it to the `relationships` block with its respective `type` and `id`.
- **Automatic Sideloading:** Related objects are added uniquely into the root `included` array, preventing reference cycles or duplicated data.
- Correctly handles empty responses (useful for operations like `DELETE`) returning `{ data: null }`.

**Usage Example:**
```typescript
@UseInterceptors(new JsonApiInterceptor('users'))
@Get()
findAll() {
  return this.usersService.findAll();
}
```

### 3. Exception Filter (`JsonApiExceptionFilter`)
**File:** `src/common/exceptions/json-api-exception.filter.ts`

Responsible for catching unhandled exceptions and HTTP exceptions, transforming them to the JSON:API standard within the `errors` property.
- Generates responses containing an array of errors with the properties `status`, `title`, and `detail`.
- Has a special integration with `class-validator`: if multiple validation errors occur, it extracts and maps them individually so the client receives the exact details of the failed fields.
- Configured globally in `main.ts` (`app.useGlobalFilters(...)`).

### 4. Deserialization Pipe (`JsonApiDeserializePipe`)
**File:** `src/common/pipes/json-api-deserialize.pipe.ts`

Responsible for receiving the client's payload (in JSON:API format) and "flattening" it or converting it into a standard DTO so the backend can work with it comfortably.
- Validates that the payload has the basic structure (`data` and `data.attributes`).
- Extracts `id` and `attributes`, reconstructing the original object.
- Throws `BadRequestException` (which is later processed by the filter) if the structure is incorrect.

### 5. Custom Body Decorator (`@JsonApiBody()`)
**File:** `src/common/decorators/json-api-body.decorator.ts`

A helper to simplify controllers. It essentially combines the use of NestJS's `@Body()` along with the `JsonApiDeserializePipe`. 

**Usage Example:**
```typescript
@Post()
create(@JsonApiBody() createDto: CreateUserDto) {
  return this.usersService.create(createDto);
}
```

### 6. Custom Query Decorator (`@JsonApiQuery()`)
**File:** `src/common/decorators/json-api-query.decorator.ts`

Extracts and processes JSON:API specific query parameters from the URL, such as the `include` parameter.
- Parses the comma-separated string (e.g., `?include=category,author`) transforming it into an array of strings (e.g., `['category', 'author']`).
- Allows injecting the options directly into the controller's method to later pass them to the services or ORM to resolve which relationships should be included from the database.

**Usage Example:**
```typescript
@Get()
findAll(@JsonApiQuery() query: JsonApiQueryOptions) {
  // query.relations will contain an array if the 'include' parameter is sent
  return this.usersService.findAll({ relations: query.relations });
}
```

## Data Flow Summary

1. **Input (Request):** 
   - In requests with data (`POST`/`PATCH`), the client sends the JSON:API. The `@JsonApiBody()` decorator transforms it into a standard DTO.
   - In queries (`GET`), the `@JsonApiQuery()` decorator reads the `include` parameters from the URL to determine relationships.
2. **Processing and Validation:** 
   Services and DTOs are used for validation (with `class-validator`). If any failure occurs, the `JsonApiExceptionFilter` ensures the error is structured under the `errors` node.
3. **Output (Response):** 
   The controller responds with a regular object containing nested related entities. The `JsonApiInterceptor` takes this object, formats it by adding `type`, separates the child entities by placing them as references in `relationships`, and injects them into the root under `included`, thus ensuring a 100% compliant JSON.

## Relations Engine Use Cases

By combining the modified interceptor (`JsonApiInterceptor`) and the query extractor (`@JsonApiQuery`), the backend is able to dynamically structure complex resources using "Sideloading".

### Fetching a resource and including its relations

**Request:**
```http
GET /articles/1?include=author,comments
```

**Flow in Controller / Service:**
```typescript
@UseInterceptors(new JsonApiInterceptor('articles'))
@Get(':id')
findOne(@Param('id') id: string, @JsonApiQuery() query: JsonApiQueryOptions) {
  // Here we instruct the ORM to also retrieve 'author' and 'comments'
  // This will return a regular nested Javascript object.
  return this.articleService.findOne(id, { relations: query.relations });
}
```

**Object Returned by the Service (Before Interceptor):**
```json
{
  "id": 1,
  "title": "Introduction to JSON:API",
  "content": "Post content...",
  "author": {
    "id": 42,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "comments": [
    { "id": 101, "text": "Excellent article" },
    { "id": 102, "text": "Helped me a lot" }
  ]
}
```

**Final HTTP Response (After Interceptor):**
```json
{
  "jsonapi": { "version": "1.0" },
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Introduction to JSON:API",
      "content": "Post content..."
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
        "text": "Excellent article"
      }
    },
    {
      "type": "comments",
      "id": "102",
      "attributes": {
        "text": "Helped me a lot"
      }
    }
  ]
}
```
As shown in the response, the interceptor correctly extracts the `author` and `comments` entities from the main document's attributes, and packages them in `included`. Additionally, it links them through the use of `relationships` inside `data`, ensuring compliance with the standard and avoiding redundant data transmission.

### Creating a new resource (POST)

**Request:**
```http
POST /articles
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "attributes": {
      "title": "New Article",
      "content": "This is a new article"
    }
  }
}
```

**Flow in Controller:**
```typescript
@Post()
create(@JsonApiBody() createDto: CreateArticleDto) {
  // @JsonApiBody() automatically extracts attributes.
  // createDto is a standard flattened object here: { title: "New Article", content: "..." }
  return this.articleService.create(createDto);
}
```

**Final HTTP Response (201 Created):**
```json
{
  "jsonapi": { "version": "1.0" },
  "data": {
    "type": "articles",
    "id": "2",
    "attributes": {
      "title": "New Article",
      "content": "This is a new article"
    }
  }
}
```

### Updating an existing resource (PATCH)

**Request:**
```http
PATCH /articles/1
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Updated Title"
    }
  }
}
```

**Flow in Controller:**
```typescript
@Patch(':id')
update(@Param('id') id: string, @JsonApiBody() updateDto: UpdateArticleDto) {
  // updateDto will contain { title: "Updated Title" }
  return this.articleService.update(id, updateDto);
}
```

**Final HTTP Response (200 OK):**
```json
{
  "jsonapi": { "version": "1.0" },
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Updated Title",
      "content": "This is a new article"
    }
  }
}
```

### Deleting a resource (DELETE)

**Request:**
```http
DELETE /articles/1
```

**Flow in Controller:**
```typescript
@Delete(':id')
remove(@Param('id') id: string) {
  return this.articleService.remove(id);
}
```

**Final HTTP Response (200 OK or 204 No Content):**
```json
{
  "data": null
}
```

### Handling Validation Errors

**Request (missing required fields):**
```http
POST /articles
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "attributes": {
      "title": "" 
    }
  }
}
```

**Final HTTP Response (400 Bad Request):**
```json
{
  "errors": [
    {
      "status": "400",
      "title": "Bad Request Exception",
      "detail": "title should not be empty"
    }
  ]
}
```
