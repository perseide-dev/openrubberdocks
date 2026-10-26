import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { AuditLogTableProps } from '@features/admin/audit-logs/types/audit.types';

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  isLoading,
  onSelectLog,
  page,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (logs.length === 0) {
    return (
      <Box sx={{ padding: 6, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
          // NO_AUDIT_LOGS_RECORDED
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
                // TIMESTAMP
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
                // ACTOR
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
                // ACTION
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
                // RESOURCE
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
                // STATUS
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
                // CODE
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
                // DURATION
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}
              >
                // INSPECT
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => {
              const isSuccess = log.status === 'SUCCESS';
              return (
                <TableRow key={log.uuid} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {log.userEmail || '// ANONYMOUS'}
                    </Typography>
                    {log.userType && (
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                      >
                        {log.userType.toUpperCase()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    {log.action}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {log.resourceType}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={log.status}
                      color={isSuccess ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {log.statusCode}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {log.executionTimeMs}ms
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<VisibilityOutlinedIcon />}
                      onClick={() => onSelectLog(log)}
                    >
                      // VIEW
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingY: 1 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          // PAGE: {page} / {totalPages} | RETRIEVED: {logs.length} RECORDS
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<ChevronLeftIcon />}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            PREV
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            endIcon={<ChevronRightIcon />}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            NEXT
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
