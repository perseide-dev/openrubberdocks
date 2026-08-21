export const USER_ERRORS_CONSTANTS = {
  ONLY_ONE_CORE_USER: (): string => `Core User already exists. Only one is allowed.`,
  USER_ALREADY_EXISTS: (): string => 'User @ already exists',
  USER_NOT_FOUND_BY_HANDLE: (handle: string): string => `User ${handle} could not be found`,
  USER_NOT_FOUND_BY_UUID: (uuid: string): string => `User ${uuid} could not be found`,
};