import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuditLogs } from '@features/admin/audit-logs/hooks/useAuditLogs';
import { AuditLogFilters } from '@features/admin/audit-logs/components/AuditLogFilters';
import { AuditLogTable } from '@features/admin/audit-logs/components/AuditLogTable';
import { AuditLogDetailDrawer } from '@features/admin/audit-logs/components/AuditLogDetailDrawer';

export interface WorkspaceAuditTabContentProps {
  workspaceUuid: string;
}

export const WorkspaceAuditTabContent: React.FC<WorkspaceAuditTabContentProps> = ({
  workspaceUuid,
}) => {
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
  } = useAuditLogs({ workspaceUuid });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, paddingY: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
            // WORKSPACE_ACTIVITY_AUDIT
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
          >
            TRACEABILITY FOR WORKSPACE MUTATIONS, PROJECT EVENTS & ROLE CHANGES
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
        hideWorkspaceFilter
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
