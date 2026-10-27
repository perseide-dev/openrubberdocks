# AGENTS.md — Mandatory AI Agent Coding & Architecture Standard

> **AUTHORITY LEVEL: CRITICAL / STRICT ENFORCEMENT**  
> All AI agents, contributors, and automated tooling operating within the **OpenRubberDocks** codebase MUST strictly adhere to the guidelines, architectural patterns, and security constraints defined in this document.
> 
> Ignorance of documentation is not permitted. Before implementing any feature, bug fix, or refactor, agents MUST consult and enforce the specifications located in:
> - `docs/` (Core security, scoped RBAC, Docker deployment, and auth consumption)
> - `backend/docs/` (NestJS architecture, JSON:API standards, filtering engine, TypeORM migrations)
> - `frontend/docs/` (Feature-Sliced Design, 4-tier API consumption flow, Brutalist theme rules)

---

## 1. Primary Directives & Governing Philosophy

1. **Documentation is the Single Source of Truth**:
   Code implementations that deviate from `docs/`, `backend/docs/`, or `frontend/docs/` will be rejected. When existing code violates documented rules (legacy or prototype drift), agents must align the code with the documentation, never downgrade the rules.
2. **Zero Assumptions on Architectural Boundaries**:
   The boundaries between Data Access, Business Orchestration, UI Logic, and Visual Presentation are absolute. Bypassing layers for speed or convenience is strictly prohibited.
3. **Defense in Depth & Deny by Default**:
   Frontend restrictions exist purely for User Experience (UX). Every single authorization and validation rule must be enforced unconditionally on the Backend.
4. **Zero Relative Path Imports (Full-Stack Enforcement)**:
   Relative imports using directory climbing (`../`, `../../`, `./../../`) are **STRICTLY PROHIBITED** in both Backend and Frontend. All imports targeting `src` subdirectories must use the configured TypeScript path aliases.

---

## 2. Universal Path Aliases & Zero Relative Imports Rule

Both `backend` and `frontend` define explicit path aliases in their respective TypeScript configurations (`backend/tsconfig.json` and `frontend/tsconfig.app.json`). 

> [!CAUTION]
> **STRICT BAN ON RELATIVE DIRECTORY CLIMBING (`../`)**  
> Never write imports such as `../../common/...` or `../../../features/...`. Every cross-directory or cross-layer import must resolve via the appropriate path alias.

### 2.1. Backend Path Aliases (`backend/tsconfig.json`)

All backend imports targeting `src/` MUST use the following aliases:

| Alias | Target Directory / Path | Usage Scope |
| :--- | :--- | :--- |
| `@/*` | `src/*` | General root-level source files |
| `@commands/*` | `src/commands/*` | CLI commands and console scripts |
| `@config/*` | `src/config/*` | Environment validation and TypeORM configurations |
| `@database/*` | `src/database/*` | Migrations and database seeders |
| `@common/*` | `src/common/*` | Shared core infrastructure |
| `@commonPipes/*` | `src/common/pipes/*` | NestJS pipes (e.g. `JsonApiDeserializePipe`) |
| `@commonDecorators/*` | `src/common/decorators/*` | Decorators (`@JsonApiBody`, `@JsonApiQuery`, `@RequirePermissions`) |
| `@commonExceptions/*` | `src/common/exceptions/*` | Exception filters (e.g. `JsonApiExceptionFilter`) |
| `@commonGuards/*` | `src/common/guards/*` | Security guards (e.g. `JwtAuthGuard`, `PermissionGuard`) |
| `@commonInterceptors/*`| `src/common/interceptors/*`| Interceptors (e.g. `JsonApiInterceptor`) |
| `@commonInterface/*` | `src/common/interface/*` | Shared interfaces (e.g. `json-api.interface.ts`) |
| `@commonUtils/*` | `src/common/utils/*` | Pure shared helper functions |
| `@modules/*` | `src/modules/*` | Domain business modules root |
| `@moduleAuth/*` | `src/modules/auth/*` | Authentication module entities, services, controllers |
| `@moduleUsers/*` | `src/modules/users/*` | Users module entities, services, controllers |
| `@moduleWorkspace/*` | `src/modules/workspace/*` | Workspace module entities, services, controllers |
| `@moduleFiles/*` | `src/modules/files/*` | File upload and storage module |
| `@moduleAuthorization/*`| `src/modules/authorization/*`| Scoped RBAC permissions and access control module |
| `@moduleProjects/*` | `src/modules/projects/*` | Projects, Kanban tasks, statuses, types, properties, time logs |
| `@moduleMcp/*` | `src/modules/mcp/*` | Model Context Protocol (MCP) SSE server and tools |
| `@moduleAudit/*` | `src/modules/audit/*` | System-wide and workspace-scoped audit logging |

#### Backend Import Examples:
```typescript
// ❌ WRONG (Relative imports forbidden)
import { User } from '../../../modules/users/entities/user.entity';
import { JsonApiExceptionFilter } from '../../common/exceptions/json-api-exception.filter';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

// ✅ CORRECT (Using designated aliases)
import { User } from '@moduleUsers/entities/user.entity';
import { JsonApiExceptionFilter } from '@commonExceptions/json-api-exception.filter';
import { RequirePermissions } from '@commonDecorators/permissions.decorator';
```

---

### 2.2. Frontend Path Aliases (`frontend/tsconfig.app.json`)

All frontend imports targeting `src/` MUST use the following aliases:

| Alias | Target Directory / Path | Usage Scope |
| :--- | :--- | :--- |
| `@assets/*` | `src/core/assets/*` | Images, icons, static graphic assets |
| `@components/*` | `src/core/components/*` | Reusable presentational UI (`forms/`, `ui/`) |
| `@config/*` | `src/core/config/*` | Global app configuration |
| `@config-env/*` | `src/core/config/env/*` | Environment variables typing and validation |
| `@config-tsq/*` | `src/core/config/tsq/*` | TanStack Query client setup |
| `@global/*` | `src/core/global/*` | Global providers and global hooks |
| `@global-hooks/*` | `src/core/global/hooks/*` | App-wide hooks (`useTheme`, `useAuth`) |
| `@global-providers/*` | `src/core/global/providers/*` | Context providers (`ThemeProvider`, etc.) |
| `@http/*` | `src/core/http/*` | Network engine root (NO UI allowed) |
| `@http-base/*` | `src/core/http/base/*` | Base HTTP client instances (`baseAPIservice`) |
| `@http-constants/*` | `src/core/http/constants/*` | HTTP status codes, network constant values |
| `@http-error/*` | `src/core/http/error/*` | HTTP error parsing and formatting |
| `@http-interceptors/*` | `src/core/http/interceptors/*`| Cookie, token injection, and 401 refresh |
| `@http-middelware/*` | `src/core/http/middelware/*` | Request/response middleware pipeline |
| `@http-types/*` | `src/core/http/types/*` | Base JSON:API and response types |
| `@layout/*` | `src/core/layout/*` | Structural frame components (Sidebar, Header) |
| `@request/*` | `src/core/request/*` | Transversal third-party requests (maps, billing) |
| `@routes/*` | `src/core/routes/*` | React router definitions and guards |
| `@theme/*` | `src/core/theme/*` | Brutalist MUI theme, typography, tokens |
| `@utils/*` | `src/core/utils/*` | Pure utilities root |
| `@utils-constants/*` | `src/core/utils/constants/*` | Global non-network constants |
| `@utils-functions/*` | `src/core/utils/functions/*` | Pure utility functions (formatting, dates) |
| `@utils-labels/*` | `src/core/utils/labels/*` | Static dictionaries, text labels, i18n |
| `@features/*` | `src/features/*` | Business domain features root |
| `@features-workspaces/*`| `src/features/workspaces/*`| Workspaces feature module |
| `@features-projects/*` | `src/features/projects/*` | Projects & Kanban feature module |
| `@features-files/*` | `src/features/files/*` | Files & Pages block editor feature module |
| `@features-admin/*` | `src/features/admin/*` | Administration & RBAC management feature module |
| `@features-audit/*` | `src/features/audit/*` | Audit logs feature module |

#### Frontend Import Examples:
```typescript
// ❌ WRONG (Relative imports forbidden)
import { formatDate } from '../../../core/utils/functions/date';
import { baseAPIservice } from '../../core/http/base/base-api.service';
import { WorkspaceCard } from '../components/WorkspaceCard';

// ✅ CORRECT (Using designated aliases)
import { formatDate } from '@utils-functions/date';
import { baseAPIservice } from '@http-base/base-api.service';
import { WorkspaceCard } from '@features-workspaces/components/WorkspaceCard';
```

---

## 3. Core Security & System-Wide Rules (`docs/`)

Refer to:
- [`docs/permissions-system-guide.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/docs/permissions-system-guide.md)
- [`docs/auth-consumption-guide.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/docs/auth-consumption-guide.md)
- [`docs/docker-deployment.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/docs/docker-deployment.md)

### 3.1. Authentication Architecture (HttpOnly Cookies)
- **Token Storage**: JSON Web Tokens (`Authentication` access token and `Refresh` token) are issued and transmitted strictly via **`httpOnly` cookies**.
- **PROHIBITION**: NEVER store JWTs or session secrets in `localStorage`, `sessionStorage`, cookies accessible by JavaScript, or global client variables.
- **Client Configuration**: Every HTTP client call (ky or axios) MUST include credentials:
  - `credentials: 'include'` (ky / Fetch API)
  - `withCredentials: true` (Axios)
- **Silent Refresh**: Expired access tokens (HTTP 401) must be handled by interceptors triggering `/auth/refresh` without user disruption, queuing concurrent failed requests to prevent race conditions.

### 3.2. Scoped RBAC & User Tier Hierarchy
The system uses a contextual Role-Based Access Control model bounded by three user tiers:

| User Type | Scope Rules | Permissions & Mutation Constraints |
| :--- | :--- | :--- |
| **`coreAdmin`** | Universal | Total scope bypass. `hasPermission()` always returns `true`. Roles & scopes are immutable via standard endpoints. |
| **`internal`** | Global (`workspaceId: null`) or Scoped (`workspaceUuid`) | Full CRUD operations allowed according to assigned roles. |
| **`external`** | **Strictly Scoped** (`workspaceUuid` required) | **Engine-Level Mutation Lock**: Strictly read-only. ANY attempt to execute `write`, `create`, `edit`, or `delete` actions is blocked at the core authorization engine, regardless of role bindings. |

- **Backend Enforcement**: Protect controllers and endpoints using `PermissionGuard` and `@RequirePermissions({ action: '...', scopeParam: '...' })`.
- **Frontend Integration**: Use `<Can action="..." workspaceId="..." fallback={...}>` or `usePermission()` for conditional rendering.

### 3.3. Docker & Environments
- Maintain configuration parity between `docker-compose.yml` and `backend/Dockerfile`.
- Support the hybrid development workflow:
  - Backend + DB containerized: `docker compose up -d`
  - DB only containerized (for local NestJS dev): `docker compose up -d db`
  - Run seeders when database structures change: `docker compose exec backend pnpm run seed:run` or `pnpm run seed:run`.

---

## 4. Backend Architecture & Development Rules (`backend/docs/`)

Refer to:
- [`backend/docs/architecture.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/backend/docs/architecture.md)
- [`backend/docs/authentication.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/backend/docs/authentication.md)
- [`backend/docs/json-api.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/backend/docs/json-api.md)
- [`backend/docs/json-api-filtering.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/backend/docs/json-api-filtering.md)
- [`backend/docs/commands.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/backend/docs/commands.md)

### 4.1. Directory Structure & Domain Modularity
The backend follows Domain-Driven Design (DDD) principles:
```plaintext
src/
├── commands/            # CLI and standalone console commands (@commands/*)
├── common/              # Shared decorators, exceptions, guards, interceptors, utils (@common/*)
│   ├── decorators/      # Custom decorators (@commonDecorators/*)
│   ├── exceptions/      # JSON:API exception filters (@commonExceptions/*)
│   ├── guards/          # Auth and permission guards (@commonGuards/*)
│   ├── interceptors/    # JSON:API interceptor (@commonInterceptors/*)
│   ├── interface/       # Global interfaces (@commonInterface/*)
│   ├── pipes/           # Deserialization pipes (@commonPipes/*)
│   └── utils/           # Shared helper functions (@commonUtils/*)
├── config/              # Environment (Zod/Joi) and TypeORM configurations (@config/*)
├── database/            # Migrations (migrations/) and Seeders (seeds/) (@database/*)
└── modules/             # Self-contained business modules (@modules/*)
    ├── auth/            # Authentication domain (@moduleAuth/*)
    ├── authorization/   # Scoped RBAC domain (@moduleAuthorization/*)
    ├── files/           # File storage domain (@moduleFiles/*)
    ├── users/           # Users domain (@moduleUsers/*)
    ├── workspace/       # Workspaces domain (@moduleWorkspace/*)
    └── <feature>/
        ├── controllers/ # HTTP route handling
        ├── dto/         # Request/response DTOs (with class-validator)
        ├── entities/    # TypeORM Entity classes
        ├── repositories/# Custom DB queries (optional, when queries are complex)
        ├── services/    # Pure business logic and domain rules
        └── <feature>.module.ts
```

### 4.2. Mandatory JSON:API v1.0 Standard
All public API endpoints MUST communicate using the **JSON:API** specification:
1. **Responses**:
   - Use `@UseInterceptors(new JsonApiInterceptor('<resource_type>'))` on controller handlers or return standard `JsonApiResponse<T>`.
   - Relationships must be dynamically formatted and sideloaded into the root `included` array without duplication or cyclical references.
2. **Payload Ingestion**:
   - Client requests must submit data under `{ data: { type: string, attributes: { ... } } }`.
   - Extract and validate payloads using `@JsonApiBody()` combined with `JsonApiDeserializePipe`.
3. **Exceptions & Errors**:
   - Handled via `JsonApiExceptionFilter`.
   - Output must match `{ errors: [{ status: string, title: string, detail: string }] }`.
   - `class-validator` violations must be mapped to distinct error objects per field.
4. **Filtering & Relations Extraction**:
   - Controllers must use `@JsonApiQuery()` to parse URL parameters (`filter[field][operator]=value` and `?include=...`).
   - Supported operators: `eq`, `like`, `gt`, `lt`, `gte`, `lte`, and compound operators `orLike`, `orEq`, `splitLike`, `splitEq`.

### 4.3. Database Migrations & Commands
- **NEVER use `schema:sync` (`DB_SYNCHRONIZE=true`) in production or shared branches.** Schema mutations must be managed via migrations.
- **Generate Migrations**: `pnpm run migration:generate -- src/database/migrations/<MigrationName>`
- **Apply Migrations**: `pnpm run migration:run`
- **Execute Seeders**: `pnpm run seed:run`
- All entities must use UUIDs or standard primary keys as defined in the domain schema and properly register relationships (OneToMany, ManyToOne, ManyToMany).

---

## 5. Frontend Architecture & Development Rules (`frontend/docs/`)

Refer to:
- [`frontend/docs/ARCHITECTURE.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/frontend/docs/ARCHITECTURE.md)
- [`frontend/docs/api-consumption.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/frontend/docs/api-consumption.md)
- [`frontend/docs/theme-guide.md`](file:///home/palmer_eldirch/Documents/projects/openrubberdocks/frontend/docs/theme-guide.md)

### 5.1. Directory Structure & Feature-Sliced Boundaries
The frontend applies an adapted **Feature-Sliced Design** architecture:
```plaintext
src/
├── core/                # Transversal logic, base UI, and global infrastructure
│   ├── assets/          # @assets/*
│   ├── components/      # @components/* (Pure reusable UI: forms/, ui/)
│   ├── config/          # @config/* (env/, tsq/)
│   ├── global/          # @global/* (hooks/, providers/)
│   ├── http/            # @http/* (base/, constants/, error/, interceptors/, types/)
│   ├── layout/          # @layout/* (Sidebar, Header, Layout wrappers)
│   ├── request/         # @request/* (Cross-domain integrations: maps, billing)
│   ├── routes/          # @routes/*
│   ├── theme/           # @theme/*
│   └── utils/           # @utils/* (functions/, labels/, constants/)
└── features/            # @features/* (Domain business modules)
    └── <feature>/
        ├── components/  # Feature-exclusive UI components
        ├── constants/   # Endpoints, Query Keys, static configurations
        ├── hooks/       # Custom React UI logic hooks
        ├── repositories/# Data access (raw HTTP calls, baseAPIservice)
        ├── services/    # TanStack Query orchestration (useQuery, invalidations)
        ├── stores/      # Feature state (Zustand)
        ├── types/       # Domain interfaces and entity models
        └── validations/ # Zod / Yup schemas
```

#### STRICT BOUNDARY ENFORCEMENT:
- **Zero Cross-Feature Imports**: A module in `features/A` MUST NEVER import from `features/B`. If logic or components are shared between features, elevate them immediately to `core/`.
- **Pure `@http`**: The `@http` folder MUST NOT contain visual UI components.

---

### 5.2. Canonical 4-Tier API Consumption Flow
Every data interaction with the backend must strictly flow through 4 decoupled tiers:

```
[ Backend API ]
       ▲
       │ HTTP (JSON:API / httpOnly Cookies)
[ 1. REPOSITORIES ] (features/<feature>/repositories/)
       │ - Raw API calls using baseAPIservice
       │ - Pure async functions returning Promise<T>
       │ - ZERO React hooks, ZERO TanStack Query dependencies
       ▲
       │ Returns typed Promise
[ 2. SERVICES ] (features/<feature>/services/)
       │ - Orchestrates TanStack Query (useQuery, useMutation)
       │ - Manages Query Keys, staleTime, and cache invalidation
       │ - EXCLUSIVELY consumes the Repositories
       ▲
       │ Exposes Queries / Mutations
[ 3. HOOKS ] (features/<feature>/hooks/)
       │ - Manages UI state, client-side filtering, sorting, pagination
       │ - Transforms raw server models for visual rendering
       │ - EXCLUSIVELY consumes the Services
       ▲
       │ Exposes state & callbacks
[ 4. COMPONENTS ] (features/<feature>/components/)
       │ - Pure visual presentation (Dumb Components)
       │ - ZERO network calls, ZERO direct TanStack Query calls
       │ - Receives props or calls the feature Hook
```

---

### 5.3. Golden Rule: Zero Explicit Inline Declarations
> [!IMPORTANT]
> **Declaring `interface`, `type`, or `const` directly inside repository, service, or hook files is STRICTLY PROHIBITED.**

1. **Interfaces & Types**:
   - Every domain type must live in `features/<feature>/types/`.
   - Global HTTP and JSON:API response types belong in `@http-types/*` or `core/`.
2. **Constants**:
   - Query Keys, endpoint paths, and default parameters must live in `features/<feature>/constants/`.
   - Generic constants belong in `@utils-constants/*`; HTTP status codes belong in `@http-constants/*`.

---

### 5.4. Digital Brutalist Theme & Styling Rules
OpenRubberDocks adheres to a **Contemporary Digital Brutalist** design system.

#### Aesthetic Pillars:
1. **Strict 90° Geometry**: `borderRadius: 0` on EVERYTHING (buttons, inputs, cards, dialogs, badges). No rounded corners or pills.
2. **Zero Drop Shadows**: `boxShadow: 'none !important'`. Depth is represented via high-contrast wireframe lines and solid fills.
3. **Solid Technical Borders**: `1.5px` to `2px solid #000000`.
4. **Typography**: Space Grotesk for bold uppercase headers/buttons; Space Mono for technical labels, data tags (`//STATUS_`), and tables.
5. **High-Voltage Accents**: Electric Yellow (`#FFE600`), Vermillion Red (`#FF3B30`), Safety Orange (`#FF5522`).

#### COMPONENT AUTHORING GOLDEN RULE: LAYOUT ONLY
> [!CAUTION]
> **Components MUST NOT declare inline visual styling.**
> 
> - **PROHIBITED IN COMPONENTS**: `border: '1px solid black'`, `borderRadius: 4`, `backgroundColor: '#000'`, `boxShadow: '...'`.
> - **ALLOWED IN COMPONENTS**: Layout and positioning CSS only: `display`, `flexDirection`, `gap`, `width`, `height`, `padding`, `margin`, `alignItems`, `justifyContent`, `gridTemplateColumns`.

All visual styling (borders, color states, hover transitions, typography) is **100% pre-configured inside the global MUI theme** (`src/core/theme/theme.ts`). Developers and agents can customize colors exclusively via the dynamic git-ignored `colors.ts` system.

---

## 6. Summary of Prohibitions ("The Absolute Don'ts")

| Violation | Why It Is Forbidden | Mandatory Solution |
| :--- | :--- | :--- |
| **Relative imports (`../` or `../../`) in Backend or Frontend** | Breaks refactoring, leads to brittle paths and directory chaos. | Use designated path aliases (`@common*`, `@module*`, `@core/*`, `@features/*`, etc.). |
| **Storing tokens in LocalStorage/SessionStorage** | High vulnerability to XSS attacks. | Use backend `httpOnly` cookies with `credentials: 'include'`. |
| **Bypassing the Backend Permission Guard** | Frontend checks are easily tampered with. | Enforce `@RequirePermissions()` on every sensitive controller action. |
| **Allowing `external` users to mutate data** | Violates engine-level security policy. | Block mutations in the authorization service automatically. |
| **Inline `interface`, `type`, or `const` in services/hooks/repos** | Breaks modularity, reusability, and clean architecture. | Extract to `types/` and `constants/`. |
| **Direct API calls inside React Components (`useEffect` + `fetch`)** | Causes unmanageable side effects and state leaks. | Follow canonical flow: Repository -> Service (TSQ) -> Hook -> Component. |
| **Cross-feature imports (`features/A` importing `features/B`)** | Violates Feature-Sliced Design and creates coupling. | Promote shared logic to `src/core/`. |
| **Inline borders, rounded corners, or bg colors in components** | Destroys brutalist design system uniformity. | Use global MUI theme defaults; component styles handle layout only. |
| **Non-JSON:API response structures** | Breaks frontend deserialization pipelines. | Use `JsonApiInterceptor` and `JsonApiResponse<T>`. |
| **Using `schema:sync` in production** | High risk of unintended database data destruction. | Use TypeORM migrations (`migration:generate` / `migration:run`). |

---

## 7. Pre-Completion Agent Audit Checklist

Before reporting any task, feature, or refactor as complete, the agent MUST run this checklist:

- [ ] **Path Aliases (Full-Stack)**: Are all imports in both `backend` and `frontend` using configured aliases? Zero relative directory climbing (`../`) across layers?
- [ ] **Security & Auth**: Are all requests authenticated via `httpOnly` cookies? No JWTs in storage?
- [ ] **Permissions**: Are backend endpoints secured with `@RequirePermissions()`? Is the `external` mutation lock preserved?
- [ ] **JSON:API Standard**: Does the controller use `JsonApiInterceptor` / `@JsonApiBody()` / `@JsonApiQuery()`?
- [ ] **Frontend Flow**: Is the 4-tier flow intact (`repositories/` -> `services/` -> `hooks/` -> `components/`)?
- [ ] **Zero Inline Declarations**: Are all types in `types/` and constants in `constants/`?
- [ ] **No Cross-Feature Imports**: Does the feature remain decoupled from other features?
- [ ] **Brutalist Theme Integrity**: Does any component contain inline borders, `borderRadius`, or background colors? (Layout styles only!)
- [ ] **Tests & Commands**: Do modified modules pass tests (`pnpm run test`) and compile cleanly?
