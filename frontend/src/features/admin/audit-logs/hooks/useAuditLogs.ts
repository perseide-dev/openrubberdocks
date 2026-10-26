import { useState, useCallback, useMemo } from 'react';
import {
  useAuditLogsService,
  useAuditWorkspacesLookupService,
} from '@features/admin/audit-logs/services/audit-admin.service';
import { DEFAULT_AUDIT_FILTERS } from '@features/admin/audit-logs/constants/audit.constants';
import type { AuditLogFilters, AuditLogItem } from '@features/admin/audit-logs/types/audit.types';

export function useAuditLogs(initialFilters?: Partial<AuditLogFilters>) {
  const [filters, setFilters] = useState<AuditLogFilters>(() => ({
    ...DEFAULT_AUDIT_FILTERS,
    ...initialFilters,
  }));

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: rawLogs, isLoading, isError, refetch } = useAuditLogsService(filters);
  const { data: rawWorkspaces } = useAuditWorkspacesLookupService();

  const logs = useMemo(() => {
    return Array.isArray(rawLogs) ? rawLogs : [];
  }, [rawLogs]);

  const workspaces = useMemo(() => {
    return Array.isArray(rawWorkspaces) ? rawWorkspaces : [];
  }, [rawWorkspaces]);

  const handleFilterChange = useCallback(
    <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === 'page' ? (value as number) : 1,
      }));
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_AUDIT_FILTERS,
      workspaceUuid: initialFilters?.workspaceUuid,
    });
  }, [initialFilters?.workspaceUuid]);

  const handleSelectLog = useCallback((log: AuditLogItem) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  return {
    logs,
    workspaces,
    isLoading,
    isError,
    filters,
    selectedLog,
    isDrawerOpen,
    handleFilterChange,
    handleResetFilters,
    handleSelectLog,
    handleCloseDrawer,
    handlePageChange,
    refetch,
  };
}
