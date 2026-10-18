export const MUTATION_ACTION_VERBS = ['write', 'create', 'edit', 'delete'] as const;

export const BASE_PERMISSIONS_ACTIONS = {
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_WRITE: 'workspace:write',
  WORKSPACE_CREATE: 'workspace:create',
  WORKSPACE_DELETE: 'workspace:delete',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_WRITE: 'document:write',
  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_ASSIGN: 'role:assign',
  GLOBAL_AUDIT: 'global:audit',
} as const;
