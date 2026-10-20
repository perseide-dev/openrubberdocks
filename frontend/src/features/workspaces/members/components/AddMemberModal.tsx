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
  CircularProgress,
  Chip,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useAddMemberModal } from '@features-workspaces/members/hooks/useAddMemberModal';
import { MEMBER_MESSAGES } from '@features-workspaces/members/constants/member.constants';
import type { AddMemberModalProps } from '@features-workspaces/members/types/member.types';

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  workspaceUuid,
  availableRoles,
  onClose,
  onSuccess,
}) => {
  const {
    searchInput,
    setSearchInput,
    searchResults,
    isSearching,
    selectedUser,
    setSelectedUser,
    selectedRoleUuid,
    setSelectedRoleUuid,
    errorMessage,
    isSubmitting,
    handleSubmit,
    reset,
  } = useAddMemberModal(workspaceUuid, availableRoles, onSuccess);

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
            {MEMBER_MESSAGES.ADD_MEMBER_TITLE}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.5 }}>
          {MEMBER_MESSAGES.ADD_MEMBER_DESCRIPTION}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, paddingTop: '16px !important' }}>
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 0, fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {errorMessage}
          </Alert>
        )}

        {/* 1. User Search / Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}
          >
            {MEMBER_MESSAGES.SELECT_USER_LABEL}
          </Typography>

          <TextField
            size="small"
            placeholder="Type @rubberHandle or username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isSubmitting}
            fullWidth
            slotProps={{
              input: {
                endAdornment: isSearching ? <CircularProgress size={16} /> : null,
                sx: { borderRadius: 0, fontFamily: 'monospace' },
              },
            }}
          />

          {/* Search results list */}
          {searchResults.length > 0 && (
            <Box
              sx={{
                maxHeight: 160,
                overflowY: 'auto',
                border: '1.5px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {searchResults.map((user) => {
                const isSelected = selectedUser?.uuid === user.uuid;
                return (
                  <Box
                    key={user.uuid}
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: isSelected ? 'action.selected' : 'transparent',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isSelected && <CheckCircleOutlineOutlinedIcon color="primary" fontSize="small" />}
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                      >
                        @{user.rubberHandle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ({user.username})
                      </Typography>
                    </Box>
                    <Chip
                      label={user.type.toUpperCase()}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 0, fontFamily: 'monospace', fontSize: '0.65rem', height: 18 }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Selected user preview card */}
          {selectedUser && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 1,
                border: '1.5px solid',
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                SELECTED: @{selectedUser.rubberHandle} ({selectedUser.username})
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => setSelectedUser(null)}
                sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
              >
                CHANGE
              </Button>
            </Box>
          )}
        </Box>

        {/* 2. Role Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}
          >
            {MEMBER_MESSAGES.SELECT_ROLE_LABEL}
          </Typography>

          <FormControl fullWidth size="small">
            <Select
              value={selectedRoleUuid}
              onChange={(e) => setSelectedRoleUuid(e.target.value)}
              disabled={isSubmitting}
              sx={{ borderRadius: 0, fontFamily: 'monospace' }}
            >
              {availableRoles.map((role) => (
                <MenuItem
                  key={role.uuid}
                  value={role.uuid}
                  sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {role.name}
                    </Typography>
                    {role.description && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {role.description}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          disabled={isSubmitting || !selectedUser || !selectedRoleUuid}
          sx={{ fontFamily: 'monospace', borderRadius: 0, fontWeight: 700 }}
        >
          {isSubmitting ? 'INVITING...' : 'INVITE_MEMBER'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
