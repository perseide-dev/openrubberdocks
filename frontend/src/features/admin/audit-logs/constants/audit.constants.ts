import type { AuditLogFilters } from '@features/admin/audit-logs/types/audit.types';

export const AUDIT_ENDPOINTS = {
  LIST: '/audit-logs',
  DETAIL: (uuid: string) => `/audit-logs/${uuid}`,
} as const;

export const AUDIT_RESOURCE_TYPE = 'audit_logs';

export const AUDIT_QUERY_KEYS = {
  ALL: ['audit-logs'] as const,
  LIST: (filters: Record<string, unknown>) => ['audit-logs', 'list', filters] as const,
  DETAIL: (uuid: string) => ['audit-logs', 'detail', uuid] as const,
} as const;

export const DEFAULT_AUDIT_FILTERS: AuditLogFilters = {
  page: 1,
  limit: 20,
};

export const STATUS_OPTIONS = [
  { value: '', label: '// ALL_STATUSES' },
  { value: 'SUCCESS', label: 'SUCCESS' },
  { value: 'FAILURE', label: 'FAILURE' },
] as const;

export const RESOURCE_TYPE_OPTIONS = [
  { value: '', label: '// ALL_RESOURCES' },
  { value: 'auth', label: 'AUTH' },
  { value: 'workspaces', label: 'WORKSPACES' },
  { value: 'users', label: 'USERS' },
  { value: 'authorization', label: 'AUTHORIZATION' },
  { value: 'projects', label: 'PROJECTS' },
  { value: 'files', label: 'FILES' },
  { value: 'mcp', label: 'MCP' },
] as const;
