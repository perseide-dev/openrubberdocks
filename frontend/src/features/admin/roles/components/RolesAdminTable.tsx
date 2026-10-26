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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import type { RolesAdminTableProps } from '@features/admin/roles/types/role-admin.types';

export const RolesAdminTable: React.FC<RolesAdminTableProps> = ({
  roles,
  onEditRole,
  onDeleteRole,
}) => {
  if (roles.length === 0) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
        >
          // NO_ROLES_FOUND
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
              // ROLE_NAME
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // DEFINITION_TYPE
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // GRANTED_PERMISSIONS
            </TableCell>
            <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role) => {
            const isSystem = role.isSystemDefined;
            const permissions = role.permissions || [];

            return (
              <TableRow
                key={role.uuid}
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
                      {role.name}
                    </Typography>
                    {role.description && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {role.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  {isSystem ? (
                    <Chip
                      label="// SYSTEM_PRESET"
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
                  ) : (
                    <Chip
                      label="// CUSTOM_ROLE"
                      size="small"
                      color="primary"
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
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip
                      label={`${permissions.length} PERMS`}
                      size="small"
                      color="primary"
                      sx={{
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 20,
                      }}
                    />
                    {permissions.map((p) => (
                      <Chip
                        key={p.uuid}
                        label={p.action}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 0,
                          fontFamily: 'monospace',
                          fontSize: '0.65rem',
                          height: 18,
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>

                <TableCell align="right">
                  {isSystem ? (
                    <Tooltip title="System roles cannot be modified or deleted">
                      <span>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                        >
                          PROTECTED
                        </Typography>
                      </span>
                    </Tooltip>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color="inherit"
                        onClick={() => onEditRole(role)}
                        title="Edit Role"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDeleteRole(role)}
                        title="Delete Role"
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
