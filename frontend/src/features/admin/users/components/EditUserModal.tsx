import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Alert,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useEditUserModal } from '@features/admin/users/hooks/useEditUserModal';
import { USER_ADMIN_MESSAGES } from '@features/admin/users/constants/user-admin.constants';
import type {
  AdminUserType,
  EditUserModalProps,
} from '@features/admin/users/types/user-admin.types';

export const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  user,
  availableRoles,
  onClose,
  onSuccess,
}) => {
  const {
    username,
    setUsername,
    rubberHandle,
    setRubberHandle,
    password,
    setPassword,
    type,
    setType,
    globalRoleUuid,
    setGlobalRoleUuid,
    isCoreAdmin,
    errorMessage,
    isSubmitting,
    handleSubmit,
    reset,
  } = useEditUserModal(user, open, onSuccess);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 0,
            boxShadow: 'none !important',
            border: '2px solid',
            borderColor: 'divider',
            padding: 1.5,
          },
        },
      }}
    >
      <DialogTitle sx={{ paddingBottom: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditOutlinedIcon color="primary" fontSize="small" />
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            {USER_ADMIN_MESSAGES.EDIT_USER_TITLE}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.5 }}>
          {USER_ADMIN_MESSAGES.EDIT_USER_DESC}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          paddingTop: '16px !important',
        }}
      >
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 0, fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {errorMessage}
          </Alert>
        )}

        {/* Full Name */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // FULL_NAME
          </Typography>
          <TextField
            size="small"
            placeholder="e.g. John Doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
            fullWidth
            slotProps={{ input: { sx: { borderRadius: 0, fontFamily: 'monospace' } } }}
          />
        </Box>

        {/* Rubber Handle */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // RUBBER_HANDLE (IDENTIFIER)
          </Typography>
          <TextField
            size="small"
            placeholder="e.g. jdoe_dev"
            value={rubberHandle}
            onChange={(e) => setRubberHandle(e.target.value)}
            disabled={isSubmitting}
            fullWidth
            slotProps={{ input: { sx: { borderRadius: 0, fontFamily: 'monospace' } } }}
          />
        </Box>

        {/* User Type */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // USER_TIER {isCoreAdmin ? '(CORE_ADMIN - IMMUTABLE)' : ''}
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as AdminUserType)}
              disabled={isSubmitting || isCoreAdmin}
              sx={{ borderRadius: 0, fontFamily: 'monospace' }}
            >
              {isCoreAdmin && (
                <MenuItem value="coreAdmin" sx={{ fontFamily: 'monospace' }}>
                  CORE ADMIN (System Administrator / Universal Bypass)
                </MenuItem>
              )}
              <MenuItem value="internal" sx={{ fontFamily: 'monospace' }}>
                INTERNAL (Full Capabilities / Global & Scoped Roles)
              </MenuItem>
              <MenuItem value="external" sx={{ fontFamily: 'monospace' }}>
                EXTERNAL (Strictly Read-Only / Scoped Only)
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Global Role Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // GLOBAL_ROLE {isCoreAdmin ? '(UNIVERSAL_SCOPE_BYPASS)' : type === 'external' ? '(DISABLED FOR EXTERNAL)' : ''}
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={globalRoleUuid}
              onChange={(e) => setGlobalRoleUuid(e.target.value)}
              disabled={isSubmitting || isCoreAdmin || type === 'external'}
              displayEmpty
              sx={{ borderRadius: 0, fontFamily: 'monospace' }}
            >
              <MenuItem value="" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                -- NO GLOBAL ROLE --
              </MenuItem>
              {availableRoles.map((role) => (
                <MenuItem key={role.uuid} value={role.uuid} sx={{ fontFamily: 'monospace' }}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* New Password (Optional) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // UPDATE_PASSWORD (OPTIONAL, MIN 8 CHARS)
          </Typography>
          <TextField
            size="small"
            type="password"
            placeholder="Leave empty to keep existing password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            fullWidth
            slotProps={{ input: { sx: { borderRadius: 0, fontFamily: 'monospace' } } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{ fontFamily: 'monospace', borderRadius: 0 }}
        >
          CANCEL
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{ fontFamily: 'monospace', borderRadius: 0, fontWeight: 700 }}
        >
          {isSubmitting ? 'SAVING...' : 'SAVE_CHANGES'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
