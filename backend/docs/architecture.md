# Achitecture

For a scalable and maintainable project in NestJS, the industry standard leans toward a modular architecture strongly influenced by the principles of Domain-Driven Design (DDD). This allows the application to grow without becoming a tightly coupled, hard-to-test monolith.

## Files Schema

```plaintext
/
├── .husky/                 # Git hooks (for Conventional Commits, linters)
├── src/
│   ├── common/             # Shared code in the entire application
│   │   ├── decorators/     # Custom decorators (@User, @Roles)
│   │   ├── exceptions/     # Global exception filters
│   │   ├── guards/         # Authentication and authorization (JwtAuthGuard)
│   │   ├── interceptors/   # Response transformation, logging
│   │   └── utils/          # Pure helper functions
│   │
│   ├── config/             # Configuration and environment variables
│   │   ├── env.validation.ts # Schema validation (ej. Joi or Zod)
│   │   └── typeorm.config.ts # Database configuration
│   │
│   ├── database/           # Files unrelated to business logic
│   │   ├── migrations/     # Schema migrations
│   │   └── seeds/          # Seed data for development
│   │
│   ├── modules/            # Feature modules (Domain)
│   │   ├── auth/           # Example module (Authentication)
│   │   └── users/          # Example module (Users)
│   │       ├── controllers/# Routes and HTTP request handling
│   │       │   └── users.controller.ts
│   │       ├── dto/        # Data Transfer Objects (with class-validator)
│   │       │   ├── create-user.dto.ts
│   │       │   └── update-user.dto.ts
│   │       ├── entities/   # Modelos ORM (Clases de TypeORM)
│   │       │   └── user.entity.ts
│   │       ├── repositories/ # Repository pattern (Optional, if DB logic is complex)
│   │       ├── services/   # Business logic
│   │       │   └── users.service.ts
│   │       └── users.module.ts # Module assembly
│   │
│   ├── app.module.ts       # Root module that imports all others
│   └── main.ts             # Entry point (bootstrap)
│
├── Dockerfile              # Image build for the API
├── pnpm-lock.yaml          # Deterministic dependency resolution
├── tsconfig.json           # Strict TypeScript configuration
└── package.json
```

## Explanation

1. **Modularity**

   - The application is divided into feature modules (`auth`, `users`, etc.), each self-contained with its own controllers, services, and entities.
   - This makes it easy to maintain and scale the application independently.

2. **Shared Code**

   - The `common` directory contains code shared across all modules, such as decorators, exceptions, guards, interceptors, and utilities.
   - This promotes code reuse and maintainability.

3. **Configuration**

   - The `config` directory contains configuration files for the application, such as environment variables and database configuration.
   - This promotes code organization and maintainability.

4. **Database**

   - The `database` directory contains database-related files, such as migrations and seed data.
   - This promotes code organization and maintainability.
