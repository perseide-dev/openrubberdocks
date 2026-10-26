import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  useAuditLogsService,
  useAuditWorkspacesLookupService,
} from '@features/admin/audit-logs/services/audit-admin.service';
import {
  DEFAULT_AUDIT_FILTERS,
  AUDIT_ACTION_DEBOUNCE_MS,
} from '@features/admin/audit-logs/constants/audit.constants';
import type {
  AuditLogFilters,
  AuditLogItem,
  UseAuditLogsOptions,
} from '@features/admin/audit-logs/types/audit.types';

export function useAuditLogs(
  initialFilters?: Partial<AuditLogFilters>,
  options?: UseAuditLogsOptions,
) {
  const [filters, setFilters] = useState<AuditLogFilters>(() => ({
    ...DEFAULT_AUDIT_FILTERS,
    ...initialFilters,
  }));

  const [debouncedAction, setDebouncedAction] = useState<string | undefined>(
    filters.action,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAction(filters.action);
    }, AUDIT_ACTION_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.action]);

  const debouncedFilters = useMemo<AuditLogFilters>(
    () => ({
      ...filters,
      action: debouncedAction,
    }),
    [filters, debouncedAction],
  );

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: rawResult, isLoading, isError, refetch } = useAuditLogsService(debouncedFilters);
  const { data: rawWorkspaces } = useAuditWorkspacesLookupService(
    options?.enableWorkspacesLookup ?? true,
  );

  const logs = useMemo(() => {
    if (!rawResult) return [];
    if (Array.isArray(rawResult)) return rawResult;
    return Array.isArray(rawResult.data) ? rawResult.data : [];
  }, [rawResult]);

  const totalPages = useMemo(() => {
    if (!rawResult || Array.isArray(rawResult)) return 1;
    return rawResult.totalPages || 1;
  }, [rawResult]);

  const total = useMemo(() => {
    if (!rawResult || Array.isArray(rawResult)) return logs.length;
    return rawResult.total ?? logs.length;
  }, [rawResult, logs.length]);

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
    setDebouncedAction(undefined);
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
    totalPages,
    total,
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
