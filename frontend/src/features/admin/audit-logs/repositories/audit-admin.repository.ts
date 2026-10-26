import { baseAPIrequest } from '@http-base/baseAPIrequest';
import { AUDIT_ENDPOINTS } from '@features/admin/audit-logs/constants/audit.constants';
import type {
  AuditLogItem,
  AuditLogFilters,
  WorkspaceLookupItem,
} from '@features/admin/audit-logs/types/audit.types';

export async function getAuditLogsRepository(
  filters?: Partial<AuditLogFilters>,
): Promise<AuditLogItem[]> {
  const queryParams = new URLSearchParams();

  if (filters?.page) queryParams.set('page', String(filters.page));
  if (filters?.limit) queryParams.set('limit', String(filters.limit));
  if (filters?.workspaceUuid) queryParams.set('workspaceUuid', filters.workspaceUuid);
  if (filters?.action) queryParams.set('action', filters.action);
  if (filters?.resourceType) queryParams.set('resourceType', filters.resourceType);
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.userId) queryParams.set('userId', String(filters.userId));
  if (filters?.from) queryParams.set('from', filters.from);
  if (filters?.to) queryParams.set('to', filters.to);

  const queryString = queryParams.toString();
  const url = queryString
    ? `${AUDIT_ENDPOINTS.LIST}?${queryString}`
    : AUDIT_ENDPOINTS.LIST;

  return baseAPIrequest.get<AuditLogItem[]>(url);
}

export async function getAuditLogDetailRepository(uuid: string): Promise<AuditLogItem> {
  return baseAPIrequest.get<AuditLogItem>(AUDIT_ENDPOINTS.DETAIL(uuid));
}

export async function getAuditWorkspacesLookupRepository(): Promise<WorkspaceLookupItem[]> {
  return baseAPIrequest.get<WorkspaceLookupItem[]>(AUDIT_ENDPOINTS.WORKSPACES);
}
