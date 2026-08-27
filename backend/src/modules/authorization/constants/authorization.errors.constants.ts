export const AUTHORIZATION_ERRORS = {
  ROLE_NOT_FOUND: (): string => 'The requested role does not exist',
  PERMISSION_NOT_FOUND: (): string => 'One or more permissions do not exist',
  CANNOT_MODIFY_CORE_USER: (): string => 'Core User roles and scopes cannot be modified',
  CANNOT_MODIFY_SYSTEM_ROLE: (): string => 'System defined roles cannot be modified or deleted',
  SCOPE_NOT_FOUND: (): string => 'The requested scope does not exist',
  INVALID_SCOPE_ASSIGNMENT: (): string => 'External users must be assigned a specific workspace or squad scope',
};
