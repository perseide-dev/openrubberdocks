# Flujo de Consumo de API y Gestión de Estado del Servidor

Esta guía define la arquitectura estricta y el flujo unidireccional canónico (basado en los principios de **Clean Architecture** y **Domain-Driven Design**) para consumir endpoints del backend y gestionar el estado del servidor en el frontend de **OpenRubberDocks**.

---

## 1. Principio Fundamental y Flujo Canónico

El flujo de datos sigue una jerarquía estricta de 4 capas desacopladas donde **el Servicio consume al Repositorio**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend API (Endpoints)                         │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ HTTP (JSON:API / Cookies)
┌───────────────────────────────────┴────────────────────────────────────┐
│ 1. REPOSITORIOS (repositories/) — Capa de Acceso a Datos               │
│    - Consulta en crudo la API usando baseAPIrequest / env.API_URL      │
│    - Funciones asíncronas puras (Promise<T>)                           │
│    - Abstrae el transporte de red sin dependencias de React ni de TSQ  │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Retorna Promise tipada
┌───────────────────────────────────┴────────────────────────────────────┐
│ 2. SERVICIOS (services/) — Capa de Casos de Uso / Orquestación         │
│    - Orquesta TanStack Query (useQuery, useMutation)                   │
│    - Define Query Keys, Cache Time, Stale Time e Invalidaciones        │
│    - Consume exclusivamente los Repositorios                           │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Expone Queries / Mutations
┌───────────────────────────────────┴────────────────────────────────────┐
│ 3. HOOKS (hooks/) — Capa de Lógica de UI                               │
│    - Maneja la lógica principal de la UI (estados locales, filtros)    │
│    - Transforma datos para la vista y coordina efectos colaterales     │
│    - Consume exclusivamente los Servicios                              │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Expone variables limpias y callbacks
┌───────────────────────────────────┴────────────────────────────────────┐
│ 4. COMPONENTES (components/) — Capa Visual Pura                        │
│    - Única y exclusivamente UI (Dumb / Presentational Components)      │
│    - Cero lógica de red, cero TanStack Query directo                   │
│    - Reciben datos y eventos vía props o desde el hook de la feature   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Regla de Oro: Cero Declaraciones Explícitas Inline

> [!IMPORTANT]
> **Prohibido declarar `interface`, `type` o `const` dentro de archivos de repositorios, servicios o hooks.**

1. **Interfaces y Tipos**:
   - Todo tipo o interfaz específico del dominio debe residir en `features/<feature>/types/`.
   - Si se trata de un tipo global o transversal (por ejemplo, estructuras JSON:API o respuestas base de red), debe importarse desde `@http-types/*` o el módulo correspondiente de `@core`.
2. **Constantes**:
   - Todos los endpoints relativos, Query Keys, parámetros por defecto o valores fijos deben residir en `features/<feature>/constants/`.
   - Si son constantes globales de red (códigos HTTP, títulos de error), deben importarse desde `@http-constants/*` o `@utils-constants/*`.
3. **Uso Obligatorio de Aliases**:
   - Nunca usar rutas relativas (`../../`). Usar siempre `@features/*`, `@http-base/*`, etc.

---

## 3. Estructura de Carpetas de una Feature

Cada módulo de negocio en `src/features/<feature>/` debe organizarse de la siguiente manera:

```text
src/features/workspaces/
├── constants/
│   └── workspace.constants.ts       # Query keys, endpoints relativos, timeouts
├── types/
│   └── workspace.types.ts           # Entidades, DTOs, Payloads, Respuestas
├── repositories/
│   └── workspace.repository.ts      # Llamadas en crudo a la API (baseAPIrequest)
├── services/
│   └── workspace.service.ts         # TanStack Query (useQuery, useMutation, invalidation)
├── hooks/
│   └── useWorkspaceList.ts          # Lógica principal de UI y estados reactivos
└── components/
    ├── WorkspaceCard.tsx            # UI pura
    └── WorkspaceList.tsx            # UI pura
```

---

## 4. Implementación Paso a Paso (Caso de Estudio: Workspaces)

A continuación se ilustra la implementación canónica y estricta para la entidad `Workspace`.

### Paso 1: Tipos de Dominio (`types/`)

Archivo: `src/features/workspaces/types/workspace.types.ts`

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

### Paso 2: Constantes de Dominio (`constants/`)

Archivo: `src/features/workspaces/constants/workspace.constants.ts`

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
  STALE_TIME: 5 * 60 * 1000, // 5 minutos
} as const;
```

---

### Paso 3: Repositorio de Consulta en Crudo (`repositories/`)

El repositorio representa la **Capa de Acceso a Datos**.
- Se encarga de hacer las peticiones HTTP directas utilizando `baseAPIrequest` (que inyecta `env.API_URL` y gestiona JSON:API y credenciales).
- Son funciones asíncronas puras (`async/await`) que retornan `Promise<T>`.
- **NO** usa React ni hooks de TanStack Query (`useQuery`, `useMutation`).
- **NO** declara tipos inline ni constantes inline.

Archivo: `src/features/workspaces/repositories/workspace.repository.ts`

```typescript
// repositories/workspace.repository.ts
import { baseAPIrequest } from '@http-base/baseAPIrequest';
import { WORKSPACE_ENDPOINTS } from '@features/workspaces/constants/workspace.constants';
import type { 
  Workspace, 
  CreateWorkspacePayload 
} from '@features/workspaces/types/workspace.types';

/**
 * Consulta en crudo la lista de workspaces desde el backend
 */
export async function getWorkspacesRepository(): Promise<Workspace[]> {
  return baseAPIrequest.get<Workspace[]>(WORKSPACE_ENDPOINTS.BASE);
}

/**
 * Consulta en crudo un workspace por su UUID
 */
export async function getWorkspaceByUuidRepository(uuid: string): Promise<Workspace> {
  return baseAPIrequest.get<Workspace>(WORKSPACE_ENDPOINTS.BY_UUID(uuid));
}

/**
 * Realiza la petición POST en crudo para persistir un workspace
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

### Paso 4: Servicio de Orquestación con TanStack Query (`services/`)

El servicio representa los **Casos de Uso y la Gestión de Estado del Servidor**.
- Consume exclusivamente los métodos del repositorio.
- Configura los hooks de **TanStack Query** (`useQuery`, `useMutation`).
- Aplica las políticas de caché (`staleTime`, `gcTime`) e invalidaciones (`queryClient.invalidateQueries`).
- **NO** declara tipos inline ni constantes inline.

Archivo: `src/features/workspaces/services/workspace.service.ts`

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
 * Hook de servicio para consultar la lista de workspaces en caché
 */
export function useWorkspacesService() {
  return useQuery<Workspace[], AppError>({
    queryKey: WORKSPACE_QUERY_KEYS.ALL,
    queryFn: getWorkspacesRepository,
    staleTime: WORKSPACE_DEFAULTS.STALE_TIME,
  });
}

/**
 * Hook de servicio para consultar el detalle de un workspace en caché
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
 * Hook de servicio para mutación de creación con invalidación de caché
 */
export function useCreateWorkspaceService() {
  const queryClient = useQueryClient();

  return useMutation<Workspace, AppError, CreateWorkspacePayload>({
    mutationFn: (payload) => createWorkspaceRepository(payload),
    onSuccess: () => {
      // Forzar actualización de la lista de workspaces en segundo plano
      queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.ALL });
    },
  });
}
```

---

### Paso 5: Hook de Lógica Principal de UI (`hooks/`)

El hook se encarga de la **Lógica de Presentación y Estado Reactivo**.
- Consume los hooks del servicio.
- Maneja estados reactivos locales (`useState`, `useMemo`, `useCallback`) como filtros de búsqueda, selección y ordenamiento.
- Simplifica la interfaz que recibirán los componentes visuales.
- **NO** declara tipos inline ni constantes inline.

Archivo: `src/features/workspaces/hooks/useWorkspaceList.ts`

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

  // Filtrado reactivo en memoria para la interfaz
  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    if (!filters.search) return workspaces;

    const query = filters.search.toLowerCase();
    return workspaces.filter((ws) => ws.name.toLowerCase().includes(query));
  }, [workspaces, filters.search]);

  // Handler de creación adaptado para la vista
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

### Paso 6: Componentes de UI Pura (`components/`)

Los componentes tienen la **única y exclusiva responsabilidad de renderizar elementos visuales**.
- Reciben sus datos y eventos del hook de la feature o mediante `props`.
- **CERO llamadas a APIs, HTTP, o TanStack Query directo**.

#### A. Tarjeta de Workspace (Presentacional Atómica)
Archivo: `src/features/workspaces/components/WorkspaceCard.tsx`

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

#### B. Lista de Workspaces (Contenedor de Vista)
Archivo: `src/features/workspaces/components/WorkspaceList.tsx`

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
    return <div className="loader">Cargando workspaces...</div>;
  }

  if (error) {
    return (
      <div className="error-banner">
        <p>Error al cargar: {error.message}</p>
      </div>
    );
  }

  return (
    <section className="workspace-container">
      <header className="workspace-header">
        <h2>Mis Workspaces</h2>
        <input
          type="search"
          placeholder="Buscar por nombre..."
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
      </header>

      {workspaces.length === 0 ? (
        <p className="empty-state">No se encontraron workspaces.</p>
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

## 5. Matriz de Responsabilidades y Ubicación Canónica

| Elemento | ¿Dónde se declara? | ¿Quién lo consume? |
| :--- | :--- | :--- |
| **Interfaces de Entidad / DTOs** | `features/<feature>/types/` | Repositorios, Servicios, Hooks, Componentes |
| **Interfaces de Red Globales** | `src/core/http/types/` (`@http-types/*`) | `baseAPIrequest`, Interceptors |
| **Endpoints y URLs Relativas** | `features/<feature>/constants/` | Repositorios |
| **Query Keys e Intervalos de Caché** | `features/<feature>/constants/` | Servicios |
| **Llamada HTTP Pura (`baseAPIrequest`)** | `features/<feature>/repositories/` | Servicios |
| **Hooks TanStack (`useQuery`, `useMutation`)** | `features/<feature>/services/` | Hooks de la feature |
| **Invalidación de Caché (`invalidateQueries`)** | `features/<feature>/services/` | Servicios (dentro de `onSuccess`) |
| **Lógica Reactiva de UI (`useState`, filtros)** | `features/<feature>/hooks/` | Componentes |
| **JSX / Estilos / Interacción Visual Pura** | `features/<feature>/components/` | Páginas / Layouts |

---

## 6. Checklist para Code Review / Pull Requests

Antes de aprobar un PR que consuma endpoints de la API, verifica:

- [ ] **¿El Repositorio solo hace llamadas en crudo?** No debe importar `@tanstack/react-query` ni usar hooks de React.
- [ ] **¿El Servicio orquesta TanStack Query?** Todas las llamadas a `useQuery`, `useMutation` e invalidaciones están aquí consumiendo al repositorio.
- [ ] **¿El Hook orquesta la lógica de UI?** Consume el servicio y expone datos procesados y handlers limpios para los componentes.
- [ ] **¿Cero declaraciones inline?** Ningún archivo en `repositories/`, `services/` o `hooks/` define `interface`, `type` o constantes con valores fijos.
- [ ] **¿Todo usa Path Aliases?** Sin `../../..` en las importaciones.
- [ ] **¿Componentes libres de lógica de red?** Los componentes no tienen llamadas `mutate()`, `queryClient`, ni promesas directas; interactúan exclusivamente a través de los custom hooks o props.
