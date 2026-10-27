import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
} from '@mui/material';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import { useRoleModal } from '@features/admin/roles/hooks/useRoleModal';
import { ROLE_ADMIN_MESSAGES } from '@features/admin/roles/constants/role-admin.constants';
import type {
  RoleFormModalProps,
  AdminPermissionItem,
} from '@features/admin/roles/types/role-admin.types';

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  open,
  roleToEdit,
  availablePermissions,
  onClose,
  onSuccess,
}) => {
  const {
    name,
    setName,
    description,
    setDescription,
    selectedPermissionUuids,
    togglePermission,
    errorMessage,
    isSubmitting,
    handleSubmit,
    reset,
  } = useRoleModal(roleToEdit, open, onSuccess);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Group permissions by category (workspace, document, role, global)
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, AdminPermissionItem[]> = {
      Workspaces: [],
      Documents: [],
      'Roles & Scopes': [],
      'System & Audit': [],
    };

    availablePermissions.forEach((p) => {
      if (p.action.startsWith('workspace:')) {
        groups.Workspaces.push(p);
      } else if (p.action.startsWith('document:')) {
        groups.Documents.push(p);
      } else if (p.action.startsWith('role:')) {
        groups['Roles & Scopes'].push(p);
      } else {
        groups['System & Audit'].push(p);
      }
    });

    return groups;
  }, [availablePermissions]);

  const isEditing = Boolean(roleToEdit);

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      maxWidth="md"
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
          <SecurityOutlinedIcon color="primary" fontSize="small" />
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            {isEditing
              ? ROLE_ADMIN_MESSAGES.EDIT_TITLE
              : ROLE_ADMIN_MESSAGES.CREATE_TITLE}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.5 }}>
          {isEditing
            ? ROLE_ADMIN_MESSAGES.EDIT_DESC
            : ROLE_ADMIN_MESSAGES.CREATE_DESC}
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

        {/* Role Name */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // ROLE_NAME
          </Typography>
          <TextField
            size="small"
            placeholder="e.g. Technical Auditor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            fullWidth
            slotProps={{ input: { sx: { borderRadius: 0, fontFamily: 'monospace' } } }}
          />
        </Box>

        {/* Description */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // DESCRIPTION
          </Typography>
          <TextField
            size="small"
            placeholder="Summary of responsibilities and access scope..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            multiline
            rows={2}
            fullWidth
            slotProps={{ input: { sx: { borderRadius: 0, fontFamily: 'monospace' } } }}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Permissions Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>
            // SELECT_ATOMIC_PERMISSIONS ({selectedPermissionUuids.length} SELECTED)
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {Object.entries(groupedPermissions).map(([category, perms]) => {
              if (perms.length === 0) return null;
              return (
                <Box
                  key={category}
                  sx={{
                    border: '1.5px solid',
                    borderColor: 'divider',
                    padding: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'primary.main',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      paddingBottom: 0.5,
                    }}
                  >
                    // {category.toUpperCase()}
                  </Typography>

                  {perms.map((p) => {
                    const checked = selectedPermissionUuids.includes(p.uuid);
                    return (
                      <FormControlLabel
                        key={p.uuid}
                        control={
                          <Checkbox
                            checked={checked}
                            onChange={() => togglePermission(p.uuid)}
                            size="small"
                            sx={{ borderRadius: 0, padding: 0.5 }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              fontWeight: checked ? 700 : 400,
                            }}
                          >
                            {p.action}
                          </Typography>
                        }
                      />
                    );
                  })}
                </Box>
              );
            })}
          </Box>
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
          {isSubmitting ? 'SAVING...' : isEditing ? 'SAVE_CHANGES' : 'CREATE_ROLE'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
