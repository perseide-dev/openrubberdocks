export const ROLE_ADMIN_ENDPOINTS = {
  ROLES: '/authorization/roles',
  ROLE_BY_UUID: (uuid: string) => `/authorization/roles/${uuid}`,
  PERMISSIONS: '/authorization/permissions',
};

export const ROLE_ADMIN_QUERY_KEYS = {
  ROLES: ['admin-roles-list'] as const,
  PERMISSIONS: ['admin-permissions-list'] as const,
};

export const ROLE_ADMIN_RESOURCE_TYPE = 'roles';

export const ROLE_ADMIN_MESSAGES = {
  TITLE: '// ROLES_AND_PERMISSIONS',
  SUBTITLE: '// SCOPED_RBAC_SECURITY_MATRIX',
  CREATE_TITLE: '// CREATE_CUSTOM_ROLE',
  CREATE_DESC:
    'Define a custom role name and bundle granular atomic permissions.',
  EDIT_TITLE: '// EDIT_CUSTOM_ROLE',
  EDIT_DESC: 'Modify custom role properties and update atomic permission bindings.',
  DELETE_CONFIRM_TITLE: (name: string) => `DELETE ROLE: ${name}`,
  DELETE_CONFIRM_DESC: (name: string) =>
    `Are you sure you want to permanently delete the custom role "${name}"? All assigned scopes holding this role will be revoked.`,
  FILTER_PLACEHOLDER: 'Filter roles by name...',
};
