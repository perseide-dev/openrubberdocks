export const MEMBER_ENDPOINTS = {
  LIST: (workspaceUuid: string) => `/workspaces/${workspaceUuid}/members`,
  ADD: (workspaceUuid: string) => `/workspaces/${workspaceUuid}/members`,
  UPDATE_ROLE: (workspaceUuid: string, userUuid: string) =>
    `/workspaces/${workspaceUuid}/members/${userUuid}`,
  REMOVE: (workspaceUuid: string, userUuid: string) =>
    `/workspaces/${workspaceUuid}/members/${userUuid}`,
  ROLES: '/authorization/roles',
  USERS_SEARCH: (search: string) =>
    `/users${search ? `?search=${encodeURIComponent(search)}` : ''}`,
};

export const MEMBER_QUERY_KEYS = {
  MEMBERS: (workspaceUuid: string) => ['workspace-members', workspaceUuid] as const,
  ROLES: ['authorization-roles'] as const,
  USERS: (search: string) => ['users-search', search] as const,
};

export const MEMBER_STALE_TIMES = {
  ROLES: 1000 * 60 * 10,
} as const;

export const MEMBER_RESOURCE_TYPE = 'workspace_members';

export const MEMBER_MESSAGES = {
  ROLE_UPDATED: '// ROLE_UPDATED_SUCCESSFULLY',
  MEMBER_ADDED: '// MEMBER_ADDED_SUCCESSFULLY',
  MEMBER_REMOVED: '// MEMBER_REMOVED_SUCCESSFULLY',
  ADD_MEMBER_TITLE: '// INVITE_WORKSPACE_MEMBER',
  ADD_MEMBER_DESCRIPTION: 'Assign a registered platform user to this workspace with a contextual role.',
  SELECT_USER_LABEL: '// SEARCH_USER_BY_HANDLE',
  SELECT_ROLE_LABEL: '// ASSIGN_ROLE',
  REMOVE_CONFIRM_TITLE: (handle: string) => `REVOKE ACCESS: @${handle}`,
  REMOVE_CONFIRM_DESC: (handle: string, wsName: string) =>
    `Are you sure you want to revoke membership and workspace permissions for @${handle} from "${wsName}"? All scoped RBAC permissions will be immediately severed.`,
};
