export type UserType = 'coreAdmin' | 'internal' | 'external';

export interface Permission {
  uuid: string;
  action: string;
}

export interface Role {
  uuid: string;
  name: string;
  description?: string;
  isSystemDefined: boolean;
  permissions: Permission[];
}

export interface UserRoleScope {
  uuid: string;
  role: Role;
  workspace?: {
    uuid: string;
    name?: string;
  } | null;
  squadId?: number | null;
}

export interface AuthUser {
  uuid: string;
  username: string;
  rubberHandle: string;
  type: UserType;
  scopes?: UserRoleScope[];
  canViewDocuments?: boolean;
  canViewProjects?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  rubberHandle: string;
  pwd: string;
}

export interface LoginBackendPayload extends Record<string, unknown> {
  rubberHandle: string;
  pwd: string;
}

export interface ChangelogDetail {
  category: string;
  description: string;
}

export interface ChangelogItem {
  version: string;
  date: string;
  status: string;
  title: string;
  highlights: string[];
  details: ChangelogDetail[];
}

export interface LoginFormState {
  rubberHandle: string;
  pwd: string;
  showPassword: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthUser | null>;
}

export interface UsePermissionsReturn {
  hasPermission: (action: string, workspaceUuid?: string) => boolean;
  hasAnyPermission: (actions: string[], workspaceUuid?: string) => boolean;
  canMutateInWorkspace: (workspaceUuid?: string) => boolean;
  isCoreAdmin: boolean;
  isExternal: boolean;
  isInternal: boolean;
  canViewDocuments: boolean;
  canViewProjects: boolean;
  userType?: UserType;
}

export interface CanProps {
  action: string;
  scope?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ScopedRouteGuardProps {
  requiredPermission?: string;
  scopeParamName?: string;
  redirectTo?: string;
  children?: React.ReactElement;
}


