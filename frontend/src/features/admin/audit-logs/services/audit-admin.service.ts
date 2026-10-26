import { useQuery } from '@tanstack/react-query';
import {
  getAuditLogsRepository,
  getAuditLogDetailRepository,
  getAuditWorkspacesLookupRepository,
} from '@features/admin/audit-logs/repositories/audit-admin.repository';
import { AUDIT_QUERY_KEYS } from '@features/admin/audit-logs/constants/audit.constants';
import type { AuditLogFilters } from '@features/admin/audit-logs/types/audit.types';

export function useAuditLogsService(filters?: Partial<AuditLogFilters>) {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.LIST(filters || {}),
    queryFn: () => getAuditLogsRepository(filters),
    staleTime: 1000 * 10, // 10 seconds
  });
}

export function useAuditLogDetailService(uuid: string, enabled = true) {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.DETAIL(uuid),
    queryFn: () => getAuditLogDetailRepository(uuid),
    enabled: Boolean(uuid) && enabled,
  });
}

export function useAuditWorkspacesLookupService() {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.WORKSPACES_LOOKUP,
    queryFn: getAuditWorkspacesLookupRepository,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
