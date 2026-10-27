export interface AuditLogItem {
  id: string | number;
  uuid: string;
  userId: number | null;
  userEmail: string | null;
  userType: string | null;
  action: string;
  resourceType: string;
  resourceUuid: string | null;
  workspaceUuid: string | null;
  status: 'SUCCESS' | 'FAILURE';
  statusCode: number;
  executionTimeMs: number;
  ipAddress: string | null;
  userAgent: string | null;
  payload: Record<string, unknown> | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  page: number;
  limit: number;
  workspaceUuid?: string;
  action?: string;
  resourceType?: string;
  status?: 'SUCCESS' | 'FAILURE';
  userId?: number;
  from?: string;
  to?: string;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogPaginatedResult {
  data: AuditLogItem[];
  totalPages: number;
  total: number;
  page: number;
}

export interface UseAuditLogsOptions {
  enableWorkspacesLookup?: boolean;
}

export interface WorkspaceLookupItem {
  id?: string | number;
  uuid: string;
  name: string;
}

export interface AuditLogTableProps {
  logs: AuditLogItem[];
  isLoading: boolean;
  onSelectLog: (log: AuditLogItem) => void;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export interface AuditLogFiltersProps {
  filters: AuditLogFilters;
  workspaces?: WorkspaceLookupItem[];
  onFilterChange: <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => void;
  onResetFilters: () => void;
  hideWorkspaceFilter?: boolean;
}

export interface AuditLogDetailDrawerProps {
  log: AuditLogItem | null;
  open: boolean;
  onClose: () => void;
  workspaces?: WorkspaceLookupItem[];
}
