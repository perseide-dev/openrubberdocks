export type UserType = 'coreAdmin' | 'internal' | 'external';

export interface AuthUser {
  uuid: string;
  username: string;
  rubberHandle: string;
  type: UserType;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  rubberHandle: string;
  pwd: string;
}

export interface LoginBackendPayload extends Record<string, unknown> {
  rubberHanlde: string;
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
