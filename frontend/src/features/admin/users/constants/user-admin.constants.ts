export const USER_ADMIN_ENDPOINTS = {
  LIST: (search?: string) =>
    `/users${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  CREATE: '/users',
  ROLES: '/authorization/roles',
};

export const USER_ADMIN_QUERY_KEYS = {
  USERS: (search?: string) => ['admin-users', search || 'all'] as const,
  ROLES: ['admin-roles'] as const,
};

export const USER_ADMIN_RESOURCE_TYPE = 'users';

export const USER_ADMIN_MESSAGES = {
  TITLE: '// SYSTEM_USERS',
  SUBTITLE: '// ENTERPRISE_ACCESS_CONTROL',
  CREATE_USER_TITLE: '// CREATE_PLATFORM_USER',
  CREATE_USER_DESC:
    'Register a new authenticated user with system credentials and assign an initial global role.',
  SUCCESS_CREATED: '// USER_CREATED_SUCCESSFULLY',
  FILTER_PLACEHOLDER: 'Filter by @handle or name...',
};
