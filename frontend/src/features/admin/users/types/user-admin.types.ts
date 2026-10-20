export type AdminUserType = 'coreAdmin' | 'internal' | 'external';

export interface AdminUserRole {
  uuid: string;
  name: string;
  description?: string;
}

export interface AdminUserScope {
  uuid: string;
  role: AdminUserRole;
  workspace?: {
    uuid: string;
    name: string;
  } | null;
}

export interface AdminUserItem {
  id: string | number;
  uuid: string;
  username: string;
  rubberHandle: string;
  type: AdminUserType;
  createdAt: string;
  scopes?: AdminUserScope[];
}

export interface CreateUserPayload extends Record<string, unknown> {
  username: string;
  rubberHandle: string;
  type: AdminUserType;
  password: string;
  initialRoleUuid?: string;
}

export interface UsersAdminTableProps {
  users: AdminUserItem[];
}

export interface CreateUserModalProps {
  open: boolean;
  availableRoles: { uuid: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}
