import React from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import AddModeratorOutlinedIcon from '@mui/icons-material/AddModeratorOutlined';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { useRoleAdmin } from '@features/admin/roles/hooks/useRoleAdmin';
import { RolesAdminTable } from '@features/admin/roles/components/RolesAdminTable';
import { RoleFormModal } from '@features/admin/roles/components/RoleFormModal';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { ROLE_ADMIN_MESSAGES } from '@features/admin/roles/constants/role-admin.constants';

export const RolesAdminPage: React.FC = () => {
  const {
    roles,
    totalCount,
    availablePermissions,
    isLoading,
    searchTerm,
    setSearchTerm,
    isFormModalOpen,
    setIsFormModalOpen,
    roleToEdit,
    roleToDelete,
    setRoleToDelete,
    errorMessage,
    setErrorMessage,
    handleOpenCreate,
    handleOpenEdit,
    handleConfirmDelete,
    isDeleting,
    refetch,
  } = useRoleAdmin();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <WorkspaceHeader
        title={ROLE_ADMIN_MESSAGES.TITLE}
        subtitle={ROLE_ADMIN_MESSAGES.SUBTITLE}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddModeratorOutlinedIcon fontSize="small" />}
            onClick={handleOpenCreate}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              borderRadius: 0,
            }}
          >
            + CREATE ROLE
          </Button>
        }
      />

      {/* Filter / Meta bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label={`// ${totalCount} DEFINED_ROLES`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{
            borderRadius: 0,
            fontFamily: 'monospace',
            fontWeight: 700,
            height: 32,
          }}
        />
        <TextField
          size="small"
          placeholder={ROLE_ADMIN_MESSAGES.FILTER_PLACEHOLDER}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              sx: { borderRadius: 0, fontFamily: 'monospace', height: 32, width: { xs: 200, sm: 300 } },
            },
          }}
        />
      </Box>

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ borderRadius: 0, fontFamily: 'monospace' }}>
          {errorMessage}
        </Alert>
      )}

      {/* Table Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <RolesAdminTable
          roles={roles}
          onEditRole={handleOpenEdit}
          onDeleteRole={setRoleToDelete}
        />
      )}

      {/* Modal: Create / Edit Role */}
      <RoleFormModal
        open={isFormModalOpen}
        roleToEdit={roleToEdit}
        availablePermissions={availablePermissions}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => {
          setIsFormModalOpen(false);
          refetch();
        }}
      />

      {/* Modal: Confirm Delete */}
      <ConfirmModal
        open={Boolean(roleToDelete)}
        title={
          roleToDelete
            ? ROLE_ADMIN_MESSAGES.DELETE_CONFIRM_TITLE(roleToDelete.name)
            : ''
        }
        description={
          roleToDelete
            ? ROLE_ADMIN_MESSAGES.DELETE_CONFIRM_DESC(roleToDelete.name)
            : ''
        }
        confirmLabel="DELETE ROLE"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setRoleToDelete(null)}
      />
    </Box>
  );
};
