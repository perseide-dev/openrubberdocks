import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { AuditLogDetailDrawerProps } from '@features/admin/audit-logs/types/audit.types';

export const AuditLogDetailDrawer: React.FC<AuditLogDetailDrawerProps> = ({
  log,
  open,
  onClose,
}) => {
  if (!log) return null;

  const isSuccess = log.status === 'SUCCESS';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 640 },
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // EVENT_INSPECTION
          </Typography>
          <Chip
            size="small"
            label={log.status}
            color={isSuccess ? 'success' : 'error'}
            variant="filled"
          />
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          // ACTION_METADATA
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {log.action}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          UUID: {log.uuid}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            // TIMESTAMP
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {new Date(log.createdAt).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            // HTTP_RESPONSE
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {log.statusCode} ({log.executionTimeMs}ms)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            // ACTOR
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {log.userEmail || '// ANONYMOUS'}{' '}
            {log.userType ? `[${log.userType.toUpperCase()}]` : ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            // IP_ADDRESS
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {log.ipAddress || '// NOT_RECORDED'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            // RESOURCE_TYPE
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {log.resourceType}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            // RESOURCE_UUID
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {log.resourceUuid || '// NULL'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, gridColumn: 'span 2' }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            // WORKSPACE_UUID
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {log.workspaceUuid || '// GLOBAL_SCOPE'}
          </Typography>
        </Box>

        {log.userAgent && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, gridColumn: 'span 2' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              // USER_AGENT
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {log.userAgent}
            </Typography>
          </Box>
        )}
      </Box>

      {log.errorMessage && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'error.main' }}>
            // ERROR_MESSAGE
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              color: 'error.main',
              padding: 1.5,
              wordBreak: 'break-word',
            }}
          >
            {log.errorMessage}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minHeight: 0 }}>
        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
          // SANITIZED_PAYLOAD
        </Typography>
        <Box
          component="pre"
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            padding: 2,
            overflow: 'auto',
            flex: 1,
            margin: 0,
          }}
        >
          {log.payload
            ? JSON.stringify(log.payload, null, 2)
            : '// NO_PAYLOAD_AVAILABLE'}
        </Box>
      </Box>
    </Drawer>
  );
};
