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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useCreateUserModal } from '@features/admin/users/hooks/useCreateUserModal';
import { USER_ADMIN_MESSAGES } from '@features/admin/users/constants/user-admin.constants';
import type { CreateUserModalProps } from '@features/admin/users/types/user-admin.types';

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  open,
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
    initialRoleUuid,
    setInitialRoleUuid,
    canViewDocuments,
    setCanViewDocuments,
    canViewProjects,
    setCanViewProjects,
    errorMessage,
    isSubmitting,
    handleSubmit,
    reset,
  } = useCreateUserModal(onSuccess);

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
          <PersonAddOutlinedIcon color="primary" fontSize="small" />
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            {USER_ADMIN_MESSAGES.CREATE_USER_TITLE}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.5 }}>
          {USER_ADMIN_MESSAGES.CREATE_USER_DESC}
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

        {/* Initial Password */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // INITIAL_PASSWORD (MIN 8 CHARS)
          </Typography>
          <TextField
            size="small"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            fullWidth
            slotProps={{ input: { sx: { borderRadius: 0, fontFamily: 'monospace' } } }}
          />
        </Box>

        {/* User Type */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // USER_TIER
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as 'internal' | 'external')}
              disabled={isSubmitting}
              sx={{ borderRadius: 0, fontFamily: 'monospace' }}
            >
              <MenuItem value="internal" sx={{ fontFamily: 'monospace' }}>
                INTERNAL (Full Capabilities / Global & Scoped Roles)
              </MenuItem>
              <MenuItem value="external" sx={{ fontFamily: 'monospace' }}>
                EXTERNAL (Strictly Read-Only / Scoped Only)
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Role or Rules Selection based on tier */}
        {type === 'external' ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              padding: 1.5,
              border: '1.5px solid',
              borderColor: 'divider',
              backgroundColor: 'action.hover',
            }}
          >
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              // EXTERNAL_ACCESS_RULES (CANNOT ASSIGN ROLES)
            </Typography>

            <FormControlLabel
              control={<Checkbox checked disabled size="small" />}
              label={
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  [MANDATORY] View assigned workspaces
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={canViewDocuments}
                  onChange={(e) => setCanViewDocuments(e.target.checked)}
                  disabled={isSubmitting}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  View documents in workspace
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={canViewProjects}
                  onChange={(e) => setCanViewProjects(e.target.checked)}
                  disabled={isSubmitting}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  View projects in workspace
                </Typography>
              }
            />
          </Box>
        ) : (
          /* Initial Role Selection */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              // INITIAL_GLOBAL_ROLE (OPTIONAL)
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={initialRoleUuid}
                onChange={(e) => setInitialRoleUuid(e.target.value)}
                disabled={isSubmitting}
                displayEmpty
                sx={{ borderRadius: 0, fontFamily: 'monospace' }}
              >
                <MenuItem value="" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  -- NO INITIAL ROLE (ASSIGN LATER) --
                </MenuItem>
                {availableRoles.map((role) => (
                  <MenuItem key={role.uuid} value={role.uuid} sx={{ fontFamily: 'monospace' }}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
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
          {isSubmitting ? 'CREATING...' : 'CREATE_USER'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
