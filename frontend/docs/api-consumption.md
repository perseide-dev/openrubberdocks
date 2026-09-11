# API Consumption and Server State Management Flow

This guide defines the strict architecture and canonical unidirectional flow (grounded in **Clean Architecture** and **Domain-Driven Design** principles) for consuming backend endpoints and managing server state in the **OpenRubberDocks** frontend.

---

## 1. Fundamental Principle and Canonical Flow

The data flow follows a strict 4-tier decoupled hierarchy where **the Service consumes the Repository**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend API (Endpoints)                         │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ HTTP (JSON:API / Cookies)
┌───────────────────────────────────┴────────────────────────────────────┐
│ 1. REPOSITORIES (repositories/) — Data Access Layer                    │
│    - Performs raw API calls using baseAPIrequest / env.API_URL         │
│    - Pure asynchronous functions (Promise<T>)                          │
│    - Abstracts network transport with zero React or TSQ dependencies   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Returns typed Promise
┌───────────────────────────────────┴────────────────────────────────────┐
│ 2. SERVICES (services/) — Use Cases / Orchestration Layer              │
│    - Orchestrates TanStack Query (useQuery, useMutation)               │
│    - Defines Query Keys, Cache Time, Stale Time, and Invalidations     │
│    - Exclusively consumes the Repositories                             │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Exposes Queries / Mutations
┌───────────────────────────────────┴────────────────────────────────────┐
│ 3. HOOKS (hooks/) — UI Logic Layer                                     │
│    - Manages main UI logic (local states, filtering, sorting)          │
│    - Transforms data for views and coordinates side effects            │
│    - Exclusively consumes the Services                                 │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Exposes clean state and callbacks
┌───────────────────────────────────┴────────────────────────────────────┐
│ 4. COMPONENTS (components/) — Pure Visual Layer                        │
│    - Exclusively UI (Dumb / Presentational Components)                 │
│    - Zero network logic, zero direct TanStack Query calls              │
│    - Receives data and callbacks via props or from the feature hook    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Golden Rule: Zero Explicit Inline Declarations

> [!IMPORTANT]
> **Declaring `interface`, `type`, or `const` directly inside repository, service, or hook files is strictly prohibited.**

1. **Interfaces and Types**:
   - Every domain-specific type or interface must reside in `features/<feature>/types/`.
   - Global or transversal types (e.g., JSON:API structures or core network response shapes) must be imported from `@http-types/*` or the corresponding `@core` module.
2. **Constants**:
   - All relative endpoint paths, Query Keys, default parameters, or static configuration values must reside in `features/<feature>/constants/`.
   - Global network constants (HTTP status codes, error titles) must be imported from `@http-constants/*` or `@utils-constants/*`.
3. **Mandatory Path Aliases**:
   - Never use relative paths (`../../`). Always use `@features/*`, `@http-base/*`, etc.

---

## 3. Feature Directory Structure

Every business module in `src/features/<feature>/` must be structured as follows:

```text
src/features/workspaces/
├── constants/
│   └── workspace.constants.ts       # Query keys, relative endpoints, timeouts
├── types/
│   └── workspace.types.ts           # Entities, DTOs, payloads, responses
├── repositories/
│   └── workspace.repository.ts      # Raw API calls (baseAPIrequest)
├── services/
│   └── workspace.service.ts         # TanStack Query (useQuery, useMutation, invalidation)
├── hooks/
│   └── useWorkspaceList.ts          # Main UI presentation logic and reactive states
└── components/
    ├── WorkspaceCard.tsx            # Pure UI component
    └── WorkspaceList.tsx            # Pure UI component
```

---

## 4. Step-by-Step Implementation (Case Study: Workspaces)

The following example demonstrates the canonical and strict implementation for the `Workspace` domain entity.

### Step 1: Domain Types (`types/`)

File: `src/features/workspaces/types/workspace.types.ts`

```typescript
// types/workspace.types.ts
export interface Workspace {
  uuid: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export interface WorkspaceFilters {
  search?: string;
  sortBy?: 'name' | 'createdAt';
}
```

---

### Step 2: Domain Constants (`constants/`)

File: `src/features/workspaces/constants/workspace.constants.ts`

```typescript
// constants/workspace.constants.ts
export const WORKSPACE_ENDPOINTS = {
  BASE: 'workspaces',
  BY_UUID: (uuid: string) => `workspaces/${uuid}`,
} as const;

export const WORKSPACE_QUERY_KEYS = {
  ALL: ['workspaces'] as const,
  LIST: (filters?: Record<string, unknown>) => ['workspaces', 'list', filters] as const,
  DETAIL: (uuid: string) => ['workspaces', 'detail', uuid] as const,
} as const;

export const WORKSPACE_DEFAULTS = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
} as const;
```

---

### Step 3: Raw Data Access Repository (`repositories/`)

The repository represents the **Data Access Layer**.
- Executes direct HTTP requests using `baseAPIrequest` (which injects `env.API_URL` and manages JSON:API serialization and session cookies).
- Consists of pure asynchronous functions (`async/await`) returning `Promise<T>`.
- **DOES NOT** use React or TanStack Query hooks (`useQuery`, `useMutation`).
- **DOES NOT** declare inline types or inline constants.

File: `src/features/workspaces/repositories/workspace.repository.ts`

```typescript
// repositories/workspace.repository.ts
import { baseAPIrequest } from '@http-base/baseAPIrequest';
import { WORKSPACE_ENDPOINTS } from '@features/workspaces/constants/workspace.constants';
import type { 
  Workspace, 
  CreateWorkspacePayload 
} from '@features/workspaces/types/workspace.types';

/**
 * Fetches the raw workspaces list from the backend
 */
export async function getWorkspacesRepository(): Promise<Workspace[]> {
  return baseAPIrequest.get<Workspace[]>(WORKSPACE_ENDPOINTS.BASE);
}

/**
 * Fetches a single workspace by UUID in raw format
 */
export async function getWorkspaceByUuidRepository(uuid: string): Promise<Workspace> {
  return baseAPIrequest.get<Workspace>(WORKSPACE_ENDPOINTS.BY_UUID(uuid));
}

/**
 * Sends a raw POST request to persist a new workspace
 */
export async function createWorkspaceRepository(
  payload: CreateWorkspacePayload
): Promise<Workspace> {
  return baseAPIrequest.post<Workspace, CreateWorkspacePayload>(
    WORKSPACE_ENDPOINTS.BASE,
    payload,
    { resourceType: 'workspaces' }
  );
}
```

---

### Step 4: Orchestration Service with TanStack Query (`services/`)

The service represents the **Use Cases and Server State Management Layer**.
- Exclusively consumes the repository functions.
- Configures **TanStack Query** hooks (`useQuery`, `useMutation`).
- Enforces caching policies (`staleTime`, `gcTime`) and cache invalidations (`queryClient.invalidateQueries`).
- **DOES NOT** declare inline types or inline constants.

File: `src/features/workspaces/services/workspace.service.ts`

```typescript
// services/workspace.service.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getWorkspacesRepository, 
  getWorkspaceByUuidRepository, 
  createWorkspaceRepository 
} from '@features/workspaces/repositories/workspace.repository';
import { 
  WORKSPACE_QUERY_KEYS, 
  WORKSPACE_DEFAULTS 
} from '@features/workspaces/constants/workspace.constants';
import type { 
  Workspace, 
  CreateWorkspacePayload 
} from '@features/workspaces/types/workspace.types';
import type { AppError } from '@http-error/http-error.handler';

/**
 * Service hook to query and cache the workspace list
 */
export function useWorkspacesService() {
  return useQuery<Workspace[], AppError>({
    queryKey: WORKSPACE_QUERY_KEYS.ALL,
    queryFn: getWorkspacesRepository,
    staleTime: WORKSPACE_DEFAULTS.STALE_TIME,
  });
}

/**
 * Service hook to query and cache workspace detail
 */
export function useWorkspaceDetailService(uuid: string) {
  return useQuery<Workspace, AppError>({
    queryKey: WORKSPACE_QUERY_KEYS.DETAIL(uuid),
    queryFn: () => getWorkspaceByUuidRepository(uuid),
    enabled: Boolean(uuid),
    staleTime: WORKSPACE_DEFAULTS.STALE_TIME,
  });
}

/**
 * Service hook for workspace creation mutation with automatic cache invalidation
 */
export function useCreateWorkspaceService() {
  const queryClient = useQueryClient();

  return useMutation<Workspace, AppError, CreateWorkspacePayload>({
    mutationFn: (payload) => createWorkspaceRepository(payload),
    onSuccess: () => {
      // Force background refetch of all workspace listings
      queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.ALL });
    },
  });
}
```

---

### Step 5: Main UI Presentation Hook (`hooks/`)

The hook manages **Presentation Logic and Local Reactive State**.
- Consumes the service hooks.
- Handles reactive local state (`useState`, `useMemo`, `useCallback`) such as search filtering, item selection, and sorting.
- Simplifies the surface API consumed by visual components.
- **DOES NOT** declare inline types or inline constants.

File: `src/features/workspaces/hooks/useWorkspaceList.ts`

```typescript
// hooks/useWorkspaceList.ts
import { useState, useMemo, useCallback } from 'react';
import { 
  useWorkspacesService, 
  useCreateWorkspaceService 
} from '@features/workspaces/services/workspace.service';
import type { 
  CreateWorkspacePayload, 
  WorkspaceFilters 
} from '@features/workspaces/types/workspace.types';

export function useWorkspaceList() {
  const [filters, setFilters] = useState<WorkspaceFilters>({});
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);

  const { data: workspaces, isLoading, error, refetch } = useWorkspacesService();
  const createMutation = useCreateWorkspaceService();

  // Reactive in-memory filtering for the UI
  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    if (!filters.search) return workspaces;

    const query = filters.search.toLowerCase();
    return workspaces.filter((ws) => ws.name.toLowerCase().includes(query));
  }, [workspaces, filters.search]);

  // View-tailored creation handler
  const handleCreate = useCallback(
    async (payload: CreateWorkspacePayload) => {
      return createMutation.mutateAsync(payload);
    },
    [createMutation]
  );

  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const handleSelectWorkspace = useCallback((uuid: string) => {
    setSelectedUuid(uuid);
  }, []);

  return {
    workspaces: filteredWorkspaces,
    rawCount: workspaces?.length ?? 0,
    isLoading,
    isCreating: createMutation.isPending,
    error,
    selectedUuid,
    handleSearchChange,
    handleSelectWorkspace,
    handleCreate,
    refresh: refetch,
  };
}
```

---

### Step 6: Pure UI Components (`components/`)

Components have the **sole and exclusive responsibility of rendering visual elements**.
- Receive data and callbacks from the feature hook or via `props`.
- **ZERO direct calls to APIs, HTTP clients, or TanStack Query**.

#### A. Workspace Card (Atomic Presentational Component)
File: `src/features/workspaces/components/WorkspaceCard.tsx`

```tsx
// components/WorkspaceCard.tsx
import React from 'react';
import type { Workspace } from '@features/workspaces/types/workspace.types';

interface WorkspaceCardProps {
  workspace: Workspace;
  isSelected?: boolean;
  onSelect: (uuid: string) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  isSelected = false,
  onSelect,
}) => {
  return (
    <article
      className={`card ${isSelected ? 'card--active' : ''}`}
      onClick={() => onSelect(workspace.uuid)}
    >
      <h3 className="card__title">{workspace.name}</h3>
      {workspace.description && (
        <p className="card__description">{workspace.description}</p>
      )}
      <time className="card__date">
        {new Date(workspace.createdAt).toLocaleDateString()}
      </time>
    </article>
  );
};
```

#### B. Workspace List (View Container Component)
File: `src/features/workspaces/components/WorkspaceList.tsx`

```tsx
// components/WorkspaceList.tsx
import React from 'react';
import { useWorkspaceList } from '@features/workspaces/hooks/useWorkspaceList';
import { WorkspaceCard } from '@features/workspaces/components/WorkspaceCard';

export const WorkspaceList: React.FC = () => {
  const {
    workspaces,
    isLoading,
    error,
    selectedUuid,
    handleSearchChange,
    handleSelectWorkspace,
  } = useWorkspaceList();

  if (isLoading) {
    return <div className="loader">Loading workspaces...</div>;
  }

  if (error) {
    return (
      <div className="error-banner">
        <p>Error loading workspaces: {error.message}</p>
      </div>
    );
  }

  return (
    <section className="workspace-container">
      <header className="workspace-header">
        <h2>My Workspaces</h2>
        <input
          type="search"
          placeholder="Search by name..."
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
      </header>

      {workspaces.length === 0 ? (
        <p className="empty-state">No workspaces found.</p>
      ) : (
        <div className="workspace-grid">
          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws.uuid}
              workspace={ws}
              isSelected={selectedUuid === ws.uuid}
              onSelect={handleSelectWorkspace}
            />
          ))}
        </div>
      )}
    </section>
  );
};
```

---

## 5. Canonical Responsibility and Placement Matrix

| Element | Declared In | Consumed By |
| :--- | :--- | :--- |
| **Domain Entity Interfaces / DTOs** | `features/<feature>/types/` | Repositories, Services, Hooks, Components |
| **Global Network Interfaces** | `src/core/http/types/` (`@http-types/*`) | `baseAPIrequest`, Interceptors |
| **Relative Endpoints and URLs** | `features/<feature>/constants/` | Repositories |
| **Query Keys and Cache Intervals** | `features/<feature>/constants/` | Services |
| **Raw HTTP Calls (`baseAPIrequest`)** | `features/<feature>/repositories/` | Services |
| **TanStack Hooks (`useQuery`, `useMutation`)** | `features/<feature>/services/` | Feature Hooks |
| **Cache Invalidation (`invalidateQueries`)** | `features/<feature>/services/` | Service (inside `onSuccess`) |
| **UI Presentation State (`useState`, filters)** | `features/<feature>/hooks/` | Components |
| **JSX / Styles / Pure Visual Interaction** | `features/<feature>/components/` | Pages / Layouts |

---

## 6. Pull Request and Code Review Checklist

Before approving a PR that touches API consumption:

- [ ] **Does the Repository only perform raw HTTP calls?** It must not import `@tanstack/react-query` or React hooks.
- [ ] **Does the Service orchestrate TanStack Query?** All `useQuery`, `useMutation`, and invalidation calls must reside here, consuming the repository.
- [ ] **Does the Hook handle UI presentation logic?** It consumes the service and exposes clean, view-ready state and handlers.
- [ ] **Zero inline declarations?** No file in `repositories/`, `services/`, or `hooks/` defines inline `interface`, `type`, or static `const` values.
- [ ] **Are Path Aliases strictly used?** No `../../..` relative paths.
- [ ] **Are Components free from network logic?** Components contain no direct `mutate()`, `queryClient`, or promises; they interact strictly through custom hooks or props.
