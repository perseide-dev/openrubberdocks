import React from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import type { MembersTableProps } from '@features-workspaces/members/types/member.types';

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  availableRoles,
  canManage,
  onUpdateRole,
  onRemoveMember,
  isUpdatingRole = false,
}) => {
  if (members.length === 0) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
        >
          // NO_MEMBERS_FOUND
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
              // USER
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // TIER
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // ASSIGNED_ROLE
            </TableCell>
            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}>
              // JOINED
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem' }}
            >
              // ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => {
            const isCore = member.userType === 'coreAdmin';
            const isExternal = member.userType === 'external';
            const isActionsDisabled = !canManage || isCore || isUpdatingRole;

            return (
              <TableRow
                key={member.userUuid}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background-color 0.15s',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                {/* User info */}
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                    >
                      @{member.rubberHandle}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {member.username}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Tier badge */}
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
                    <Tooltip title="External users are locked to read-only by the authorization engine">
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
                    </Tooltip>
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

                {/* Role select */}
                <TableCell sx={{ minWidth: 200 }}>
                  {isCore ? (
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}
                    >
                      IMMUTABLE_GLOBAL_BYPASS
                    </Typography>
                  ) : (
                    <Select
                      size="small"
                      value={member.role?.uuid || ''}
                      onChange={(e) => onUpdateRole(member.userUuid, e.target.value)}
                      disabled={isActionsDisabled}
                      fullWidth
                      sx={{
                        borderRadius: 0,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        height: 32,
                      }}
                    >
                      {availableRoles.map((role) => (
                        <MenuItem
                          key={role.uuid}
                          value={role.uuid}
                          sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                        >
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>

                {/* Joined Date */}
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                  >
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  {isCore ? (
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                      --
                    </Typography>
                  ) : (
                    <Tooltip title={canManage ? 'Revoke Workspace Membership' : 'Insufficient permissions'}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onRemoveMember(member)}
                          disabled={isActionsDisabled}
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
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
