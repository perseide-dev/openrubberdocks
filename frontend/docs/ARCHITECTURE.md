# Frontend Architecture & Guidelines

This document describes the frontend architecture, how the main folders are structured, and the strict development rules to keep the project scalable and clean.

## 🏗️ Main Structure

The project follows an adaptation of the **Feature-Sliced Design** pattern. The code is divided into global responsibilities (`core`) and business modules (`features`).

```text
src/
├── core/              # Transversal logic, base UI, and global configuration
│   ├── assets/        # Images, fonts, icons (@assets/*)
│   ├── components/    # Pure and reusable UI components (@components/*)
│   │   ├── forms/     # Form components (Inputs, Selects)
│   │   └── ui/        # Generic base components (Buttons, Modals, Cards)
│   ├── config/        # Global configurations (@config/*)
│   │   ├── env/       # Environment variables and validation (@config-env/*)
│   │   └── tsq/       # TanStack Query configuration (@config-tsq/*)
│   ├── global/        # Global third-party integrations (@global/*)
│   │   ├── hooks/     # Global scope hooks (@global-hooks/*)
│   │   └── providers/ # Global Context Providers (@global-providers/*)
│   ├── http/          # Network engine and JSON:API standards (@http/*)
│   │   ├── base/      # ky/fetch instances (@http-base/*)
│   │   ├── constants/ # HTTP codes, URLs (@http-constants/*)
│   │   ├── error/     # Error handling and formatting (@http-error/*)
│   │   ├── interceptors/# Auth and token injection (@http-interceptors/*)
│   │   ├── middelware/# Request middleware logic (@http-middelware/*)
│   │   └── types/     # Base response interfaces (@http-types/*)
│   ├── layout/        # Structural components (Header, Sidebar) (@layout/*)
│   ├── request/       # Transversal requests or external integrations (@request/*)
│   │   └── example/   # Global integration example (e.g., google-maps, stripe)
│   │       ├── constants/  # API-specific constants
│   │       ├── hooks/      # React Query hooks for these requests
│   │       ├── repositories/# Transversal repository implementation
│   │       ├── routes/     # Route/endpoint definitions for this API
│   │       ├── services/   # Transversal logic orchestration and TSQ (Invalidations)
│   │       └── types/      # Interfaces and types for this external API
│   ├── routes/        # Routing definition (@routes/*)
│   ├── theme/         # Design, tokens, and styles (@theme/*)
│   └── utils/         # Utilities and pure functions (@utils/*)
│       ├── constants/ # General constants (@utils-constants/*)
│       ├── functions/ # Helper functions (@utils-functions/*)
│       └── labels/    # Static texts or i18n (@utils-labels/*)
├── features/          # Business modules (Clean Architecture / Feature-Sliced) (@features/*)
│   ├── auth/          # Feature example (Authentication)
│   │   ├── components/# Feature-exclusive UI components
│   │   ├── constants/ # Feature-specific business constants
│   │   ├── hooks/     # Business and custom React hooks
│   │   ├── repositories/# Data access, network requests (Repository Pattern)
│   │   ├── services/  # Use cases, TSQ logic (Invalidations), and business rules
│   │   ├── stores/    # Feature global state (Zustand/Redux)
│   │   ├── types/     # Domain Entities, Interfaces, and Types
│   │   └── validations/# Validation schemas (Zod, Yup) and business rules
│   └── example/       # Generic example
│       └── sub-example-1/ # Features can be nested into sub-modules
├── docs/              # Technical documentation (this file)
└── App.tsx            # Entry point
```

## 🧩 The `core` Directory and its Aliases

To keep imports clean and avoid the relative path hell (`../../../`), we use strict aliases for each `core` module and for `features`.

### 1. `config` (`@config/*`)
Global configurations that do not belong to the network.
- **`env/`** (`@config-env/*`): Environment variable typing and validation.
- **`tsq/`** (`@config-tsq/*`): TanStack Query (React Query) base configuration.

### 2. `global` (`@global/*`)
Third-party integrations that wrap the entire app.
- **`hooks/`** (`@global-hooks/*`): Global hooks (e.g., `useTheme`, `useAuth`).
- **`providers/`** (`@global-providers/*`): Context Providers (e.g., `ThemeProvider`, `DndProvider`).

### 3. `http` (`@http/*`)
The application's network engine. **MUST NOT contain UI components**.
- **`base/`** (`@http-base/*`): Base instances (e.g., `baseAPIservice` configured with `ky`).
- **`interceptors/`** (`@http-interceptors/*`): Interceptors for token injection or session refresh.
- **`error/`** (`@http-error/*`): Standardized error handling and formatting.
- **`middelware/`** (`@http-middelware/*`): Intermediate logic before or after the request.
- **`constants/`** (`@http-constants/*`): HTTP status codes, base URLs.
- **`types/`** (`@http-types/*`): Standard response interfaces (e.g., JSON:API).

### 4. `utils` (`@utils/*`)
Pure functions and generic utilities.
- **`functions/`** (`@utils-functions/*`): Helper functions (e.g., date and string formatting).
- **`labels/`** (`@utils-labels/*`): Static text dictionaries or i18n configuration.
- **`constants/`** (`@utils-constants/*`): Generic constant values.

### Other directories:
- **`assets/`** (`@assets/*`): Images, icons, fonts.
- **`components/`** (`@components/*`): Pure and reusable UI components (Buttons, Modals, Inputs).
- **`layout/`** (`@layout/*`): Page structures (Sidebar, Navbar, Footer).
- **`request/`** (`@request/*`): Global requests or external integrations (e.g., Google Maps).
- **`routes/`** (`@routes/*`): Route definitions (React Router).
- **`theme/`** (`@theme/*`): Design tokens, colors, typography.
- **`features/`** (`@features/*`): Business modules and domain-specific logic.

---

## 📜 Golden Rules (Dos & Don'ts)

### ✅ DOS

1. **ALWAYS USE ALIASES:** Absolutely all imports coming from `core` or `features` must use their corresponding alias.
   * *Good:* `import { formatDate } from '@utils-functions/date'`
   * *Bad:* `import { formatDate } from '../../../core/utils/functions/date'`
2. **SEPARATE BUSINESS LOGIC:** If a component, hook, or request belongs specifically to a business entity (e.g., "Users"), **it must go in `features/users/`**, NOT in `core`.
3. **KEEP `http` PURE:** The `@http` folder is only for client configuration (ky/axios), typings, and interceptors. Real requests are made in `features/.../repositories` or in `@request` (if they are truly global).
4. **DUMB COMPONENTS:** Components in `@components` must not have complex state or make API requests. They receive data via `props`.
5. **SERVICES AND REPOSITORIES RESPONSIBILITY:** **Repositories** are *exclusively* in charge of data access (calling the API using `@http-base`). **Services** are the ones that orchestrate this logic, manage the server state with **TanStack Query (TSQ)**, and perform cache invalidations (`queryClient.invalidateQueries`).

### ❌ DON'TS

1. **NO UNWRAPPED LIBRARIES:** If you install a complex third-party library, do not use it directly in your business components. Create a provider in `@global-providers` or a hook in `@global-hooks`.
2. **NO MIXED CONSTANTS:** Do not place network constants (HTTP codes) in `@utils-constants`. That's what `@http-constants` is for. Maintain cohesion.
3. **NO DIRECT REQUESTS FROM THE UI:** Never use `fetch` or `ky` directly inside a `useEffect` in a visual component. Always extract the request to a repository and use a service to manage it with TanStack Query.
4. **NO CROSS-IMPORTS BETWEEN FEATURES:** A module inside `features/A` should not import internal code from `features/B`. If both need to share logic, that logic must be moved up to `core`.
