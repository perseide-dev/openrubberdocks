import React from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Chip,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { WorkspaceHeader } from '@components/ui/WorkspaceHeader';
import { useUserAdmin } from '@features/admin/users/hooks/useUserAdmin';
import { UsersAdminTable } from '@features/admin/users/components/UsersAdminTable';
import { CreateUserModal } from '@features/admin/users/components/CreateUserModal';
import { EditUserModal } from '@features/admin/users/components/EditUserModal';
import { USER_ADMIN_MESSAGES } from '@features/admin/users/constants/user-admin.constants';

export const UsersAdminPage: React.FC = () => {
  const {
    users,
    totalCount,
    availableRoles,
    isLoading,
    searchTerm,
    setSearchTerm,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    userToEdit,
    handleOpenEditModal,
    handleCloseEditModal,
    refetch,
  } = useUserAdmin();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <WorkspaceHeader
        title={USER_ADMIN_MESSAGES.TITLE}
        subtitle={USER_ADMIN_MESSAGES.SUBTITLE}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddOutlinedIcon fontSize="small" />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              borderRadius: 0,
            }}
          >
            + CREATE USER
          </Button>
        }
      />

      {/* Filter / Meta bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label={`// ${totalCount} REGISTERED_USERS`}
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
          placeholder={USER_ADMIN_MESSAGES.FILTER_PLACEHOLDER}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              sx: { borderRadius: 0, fontFamily: 'monospace', height: 32, width: { xs: 200, sm: 300 } },
            },
          }}
        />
      </Box>

      {/* Table Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <UsersAdminTable
          users={users}
          onEditUser={handleOpenEditModal}
        />
      )}

      {/* Modal: Create User */}
      <CreateUserModal
        open={isCreateModalOpen}
        availableRoles={availableRoles}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />

      {/* Modal: Edit User */}
      <EditUserModal
        open={isEditModalOpen}
        user={userToEdit}
        availableRoles={availableRoles}
        onClose={handleCloseEditModal}
        onSuccess={() => {
          handleCloseEditModal();
          refetch();
        }}
      />
    </Box>
  );
};
