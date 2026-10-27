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
  IconButton,
  Tooltip,
} from '@mui/material';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { API_KEYS_MESSAGES } from '@features/admin/api-keys/constants/api-keys.constants';
import type { ApiKeysTableProps } from '@features/admin/api-keys/types/api-keys.types';

const isKeyExpired = (expiresAt: string | null): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
};

export const ApiKeysTable: React.FC<ApiKeysTableProps> = ({
  keys,
  onRevoke,
  onDelete,
}) => {
  if (keys.length === 0) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
        >
          {API_KEYS_MESSAGES.NO_KEYS_FOUND}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 0,
        boxShadow: 'none',
        border: '1.5px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // KEY_NAME
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // TOKEN_PREFIX
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // STATUS
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // LAST_USED
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // EXPIRES_AT
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // CREATED_AT
            </TableCell>
            <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map((key) => {
            const expired = isKeyExpired(key.expiresAt);
            const active = key.isActive && !expired;

            return (
              <TableRow
                key={key.uuid}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {key.name}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  <code>{key.keyPrefix}...</code>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      !key.isActive
                        ? API_KEYS_MESSAGES.REVOKED
                        : expired
                        ? API_KEYS_MESSAGES.EXPIRED
                        : API_KEYS_MESSAGES.ACTIVE
                    }
                    size="small"
                    color={
                      !key.isActive
                        ? 'default'
                        : expired
                        ? 'warning'
                        : 'success'
                    }
                    variant={active ? 'filled' : 'outlined'}
                    sx={{
                      borderRadius: 0,
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                  {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                  {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                  {new Date(key.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    {key.isActive && !expired && (
                      <Tooltip title="Revoke Key">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onRevoke(key)}
                        >
                          <BlockOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete Record">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(key)}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
