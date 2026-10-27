export interface AdminPermissionItem {
  id?: string | number;
  uuid: string;
  action: string;
}

export interface AdminRoleItem {
  id: string | number;
  uuid: string;
  name: string;
  description?: string;
  isSystemDefined: boolean;
  permissions?: AdminPermissionItem[];
}

export interface CreateRolePayload extends Record<string, unknown> {
  name: string;
  description?: string;
  permissionUuids: string[];
}

export interface UpdateRolePayload extends Record<string, unknown> {
  name?: string;
  description?: string;
  permissionUuids?: string[];
}

export interface RolesAdminTableProps {
  roles: AdminRoleItem[];
  onEditRole: (role: AdminRoleItem) => void;
  onDeleteRole: (role: AdminRoleItem) => void;
}

export interface RoleFormModalProps {
  open: boolean;
  roleToEdit: AdminRoleItem | null;
  availablePermissions: AdminPermissionItem[];
  onClose: () => void;
  onSuccess: () => void;
}
