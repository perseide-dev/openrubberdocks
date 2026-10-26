export const USER_ADMIN_ENDPOINTS = {
  LIST: (search?: string) =>
    `/users${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  CREATE: '/users',
  USER_BY_UUID: (uuid: string) => `/users/${uuid}`,
  ROLES: '/authorization/roles',
};

export const USER_ADMIN_QUERY_KEYS = {
  ALL_USERS: ['admin-users'] as const,
  USERS: (search?: string) => ['admin-users', search || 'all'] as const,
  ROLES: ['admin-roles'] as const,
};

export const USER_ADMIN_STALE_TIMES = {
  ROLES: 1000 * 60 * 10,
} as const;

export const USER_ADMIN_RESOURCE_TYPE = 'users';

export const USER_ADMIN_MESSAGES = {
  TITLE: '// SYSTEM_USERS',
  SUBTITLE: '// ENTERPRISE_ACCESS_CONTROL',
  CREATE_USER_TITLE: '// CREATE_PLATFORM_USER',
  CREATE_USER_DESC:
    'Register a new authenticated user with system credentials and assign an initial global role.',
  EDIT_USER_TITLE: '// EDIT_PLATFORM_USER',
  EDIT_USER_DESC:
    'Modify platform user details, update user tier, or reassign global role.',
  SUCCESS_CREATED: '// USER_CREATED_SUCCESSFULLY',
  SUCCESS_UPDATED: '// USER_UPDATED_SUCCESSFULLY',
  FILTER_PLACEHOLDER: 'Filter by @handle or name...',
};
