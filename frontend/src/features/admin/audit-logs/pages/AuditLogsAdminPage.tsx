import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuditLogs } from '@features/admin/audit-logs/hooks/useAuditLogs';
import { AuditLogFilters } from '@features/admin/audit-logs/components/AuditLogFilters';
import { AuditLogTable } from '@features/admin/audit-logs/components/AuditLogTable';
import { AuditLogDetailDrawer } from '@features/admin/audit-logs/components/AuditLogDetailDrawer';

export const AuditLogsAdminPage: React.FC = () => {
  const {
    logs,
    isLoading,
    filters,
    selectedLog,
    isDrawerOpen,
    handleFilterChange,
    handleResetFilters,
    handleSelectLog,
    handleCloseDrawer,
    handlePageChange,
    refetch,
  } = useAuditLogs();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '0.05em' }}>
            // AUDIT TRAIL & PLATFORM TRACEABILITY
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
          >
            SYSTEM-WIDE MUTATION LOGS, SECURITY EVENTS & FORENSIC PAYLOAD INSPECTION
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
        >
          // REFRESH
        </Button>
      </Box>

      <AuditLogFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <AuditLogTable
        logs={logs}
        isLoading={isLoading}
        onSelectLog={handleSelectLog}
        page={filters.page}
        totalPages={1}
        onPageChange={handlePageChange}
      />

      <AuditLogDetailDrawer
        log={selectedLog}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </Box>
  );
};
