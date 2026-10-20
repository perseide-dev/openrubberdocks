import React from 'react';
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useWorkspaceMembers } from '@features-workspaces/members/hooks/useWorkspaceMembers';
import { MembersTable } from '@features-workspaces/members/components/MembersTable';
import { AddMemberModal } from '@features-workspaces/members/components/AddMemberModal';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { MEMBER_MESSAGES } from '@features-workspaces/members/constants/member.constants';
import type { MembersTabContentProps } from '@features-workspaces/members/types/member.types';

export const MembersTabContent: React.FC<MembersTabContentProps> = ({
  workspaceUuid,
  canManage,
}) => {
  const {
    members,
    totalCount,
    availableRoles,
    isLoading,
    searchTerm,
    setSearchTerm,
    memberToRemove,
    setMemberToRemove,
    isAddModalOpen,
    setIsAddModalOpen,
    errorMessage,
    setErrorMessage,
    handleUpdateRole,
    handleConfirmRemove,
    isUpdatingRole,
    isRemovingMember,
    refetch,
  } = useWorkspaceMembers(workspaceUuid);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Action / Filter Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={`// ${totalCount} MEMBERS`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              borderRadius: 0,
              fontFamily: 'monospace',
              fontWeight: 700,
              height: 28,
            }}
          />
          <TextField
            size="small"
            placeholder="Filter by @handle or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                sx: { borderRadius: 0, fontFamily: 'monospace', height: 32, width: { xs: 180, sm: 260 } },
              },
            }}
          />
        </Box>

        {canManage && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PersonAddOutlinedIcon fontSize="small" />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              borderRadius: 0,
              letterSpacing: '0.04em',
              height: 32,
            }}
          >
            + ADD MEMBER
          </Button>
        )}
      </Box>

      {/* Error alert */}
      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage(null)}
          sx={{ borderRadius: 0, fontFamily: 'monospace', fontSize: '0.8rem' }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Main Table Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <MembersTable
          members={members}
          availableRoles={availableRoles}
          canManage={canManage}
          onUpdateRole={handleUpdateRole}
          onRemoveMember={setMemberToRemove}
          isUpdatingRole={isUpdatingRole}
        />
      )}

      {/* Modal: Add Member */}
      <AddMemberModal
        open={isAddModalOpen}
        workspaceUuid={workspaceUuid}
        availableRoles={availableRoles}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />

      {/* Modal: Confirm Removal */}
      <ConfirmModal
        open={Boolean(memberToRemove)}
        title={
          memberToRemove
            ? MEMBER_MESSAGES.REMOVE_CONFIRM_TITLE(memberToRemove.rubberHandle)
            : ''
        }
        description={
          memberToRemove
            ? MEMBER_MESSAGES.REMOVE_CONFIRM_DESC(
                memberToRemove.rubberHandle,
                workspaceUuid,
              )
            : ''
        }
        confirmLabel="REVOKE ACCESS"
        isLoading={isRemovingMember}
        onConfirm={handleConfirmRemove}
        onClose={() => setMemberToRemove(null)}
      />
    </Box>
  );
};
