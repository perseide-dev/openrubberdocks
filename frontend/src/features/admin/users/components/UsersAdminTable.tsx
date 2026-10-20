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
} from '@mui/material';
import type { UsersAdminTableProps } from '@features/admin/users/types/user-admin.types';

export const UsersAdminTable: React.FC<UsersAdminTableProps> = ({ users }) => {
  if (users.length === 0) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
        >
          // NO_USERS_FOUND
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
              // USER_HANDLE
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // USER_TIER
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // ASSIGNED_SCOPES
            </TableCell>
            <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // CREATED_AT
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const isCore = user.type === 'coreAdmin';
            const isExternal = user.type === 'external';

            return (
              <TableRow
                key={user.uuid}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background-color 0.15s',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                    >
                      @{user.rubberHandle}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {user.username}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  {isCore && (
                    <Chip
                      label="// CORE_ADMIN"
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 20,
                      }}
                    />
                  )}
                  {isExternal && (
                    <Chip
                      label="// EXTERNAL"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 20,
                      }}
                    />
                  )}
                  {!isCore && !isExternal && (
                    <Chip
                      label="// INTERNAL"
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 20,
                      }}
                    />
                  )}
                </TableCell>

                <TableCell>
                  {isCore ? (
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}
                    >
                      UNIVERSAL_SCOPE_BYPASS
                    </Typography>
                  ) : user.scopes && user.scopes.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.scopes.map((scope) => (
                        <Chip
                          key={scope.uuid}
                          label={
                            scope.workspace
                              ? `${scope.role.name} (${scope.workspace.name})`
                              : `${scope.role.name} [GLOBAL]`
                          }
                          size="small"
                          sx={{
                            borderRadius: 0,
                            fontFamily: 'monospace',
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                      // NO_ASSIGNED_SCOPES
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="right">
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                  >
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '--'}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
