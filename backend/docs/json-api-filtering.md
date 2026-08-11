# JSON:API Filtering Engine Implementation

The backend features a dynamic and flexible filtering engine implemented through the `@JsonApiQuery()` decorator. This allows clients to send complex queries via the URL, which are automatically translated into a structure that the services and the ORM can easily consume.

## 1. How the Decorator Works

The `@JsonApiQuery()` decorator automatically processes the `filter` parameter coming from the request.

**Parsed Structure (`JsonApiQueryOptions`):**
```typescript
export interface JsonApiQueryOptions {
    relations?: string[];        // Relations to include (include parameter)
    filters?: JsonApiFilter[];   // Processed filters
}

export interface JsonApiFilter {
    fields: string[];         // Array of fields/columns to filter
    operator: FilterOperator; // Operator defined by the client
    value: string;            // Searched value
}
```

## 2. Supported Operators (`FilterOperator`)

The engine includes a catalog of operators to define the search behavior in the database:

- `eq`: Exact match (=).
- `like`: Partial text search (similar to `ILIKE` in SQL).
- `gt`: Greater than (>).
- `lt`: Less than (<).
- `gte`: Greater than or equal to (>=).
- `lte`: Less than or equal to (<=).
- **Multi-field Operators (Compound Searches):**
  - `orLike`: Searches for the **same** partial term across multiple columns using an "OR" (e.g., search for the word "John" in `firstName` OR `lastName`).
  - `orEq`: Same as `orLike`, but requires an exact match.
  - `splitLike`: Split search. Ideal for global search bars. Splits the search string by spaces and performs a partial search assigning each segment to its respective column.
  - `splitEq`: Same as `splitLike` but demanding exact match for each segment.

## 3. URL Format (Client)

To send these filters from the frontend/HTTP client, the nested object notation in Query Parameters native to JSON:API is used. The structure is `filter[columns][operator]=value`.

### HTTP Request Examples:

**Simple Filter (Exact match):**
Get users who are exactly 25 years old.
```http
GET /users?filter[age][eq]=25
```

**Partial Search:**
Users whose email contains "gmail".
```http
GET /users?filter[email][like]=gmail
```

**Multi-field Filter with OR:**
Search for the word "John" in the `firstName` field or the `lastName` field. Notice how columns are comma-separated inside the first brackets.
```http
GET /users?filter[firstName,lastName][orLike]=John
```

**Multiple Combined Filters (Logical AND):**
Users older than 18 **AND** whose first name is exactly "Jane".
```http
GET /users?filter[age][gt]=18&filter[firstName][eq]=Jane
```

## 4. Backend Implementation

To apply the filtering engine to a new `GET` endpoint, the process involves extracting the query in the controller and applying it to your ORM's query builder inside the service.

### Step 1: In the Controller

Inject the `@JsonApiQuery()` decorator to obtain the already parsed array of filters.

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { JsonApiQuery, JsonApiQueryOptions } from '@common/decorators/json-api-query.decorator';
import { JsonApiInterceptor } from '@common/interceptors/json-api.interceptor';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(new JsonApiInterceptor('users'))
  @Get()
  findAll(@JsonApiQuery() query: JsonApiQueryOptions) {
    // We pass the object with relations and filters directly to the service
    return this.usersService.findAll(query);
  }
}
```

### Step 2: In the Service (Reference Example with TypeORM)

The service receives the unified structure. You must iterate over `query.filters` to dynamically concatenate the logical conditions into your database query.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { User } from './entities/user.entity';
import { JsonApiQueryOptions } from '@common/decorators/json-api-query.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: JsonApiQueryOptions) {
    const qb = this.userRepository.createQueryBuilder('user');

    // 1. Apply Relationships Inclusion (if any)
    if (query.relations?.length) {
      query.relations.forEach(relation => {
         qb.leftJoinAndSelect(`user.${relation}`, relation);
      });
    }

    // 2. Dynamic Filter Construction
    if (query.filters?.length) {
      query.filters.forEach((filter, index) => {
        const valueParam = `value_${index}`; // Unique parameter name to avoid collisions
        const fieldName = `user.${filter.fields[0]}`;
        
        switch (filter.operator) {
          case 'eq':
            qb.andWhere(`${fieldName} = :${valueParam}`, { [valueParam]: filter.value });
            break;
          case 'like':
            qb.andWhere(`${fieldName} ILIKE :${valueParam}`, { [valueParam]: `%${filter.value}%` });
            break;
          case 'gt':
            qb.andWhere(`${fieldName} > :${valueParam}`, { [valueParam]: filter.value });
            break;
          case 'lt':
            qb.andWhere(`${fieldName} < :${valueParam}`, { [valueParam]: filter.value });
            break;
            
          // Multi-field Operator Example (Compound search)
          case 'orLike':
            qb.andWhere(new Brackets(qbInner => {
              filter.fields.forEach((field, fieldIdx) => {
                const paramName = `orLike_${index}_${fieldIdx}`;
                if (fieldIdx === 0) {
                  qbInner.where(`user.${field} ILIKE :${paramName}`, { [paramName]: `%${filter.value}%` });
                } else {
                  qbInner.orWhere(`user.${field} ILIKE :${paramName}`, { [paramName]: `%${filter.value}%` });
                }
              });
            }));
            break;
            
          // Implement other required operators... (splitLike, gte, etc.)
        }
      });
    }

    return await qb.getMany();
  }
}
```

By following this pattern, controllers stay lean, and the validation and extraction of filters coming from the network occurs centralized in a single reusable decorator.
