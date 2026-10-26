import React from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Paper,
  Typography,
} from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import { WorkspaceHeader } from '@components/ui/WorkspaceHeader';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { useApiKeys } from '@features/admin/api-keys/hooks/useApiKeys';
import { ApiKeysTable } from '@features/admin/api-keys/components/ApiKeysTable';
import { CreateApiKeyModal } from '@features/admin/api-keys/components/CreateApiKeyModal';
import { TokenDisplayModal } from '@features/admin/api-keys/components/TokenDisplayModal';
import { API_KEYS_MESSAGES } from '@features/admin/api-keys/constants/api-keys.constants';

export const ApiKeysAdminPage: React.FC = () => {
  const {
    keys,
    totalCount,
    isLoading,
    searchTerm,
    setSearchTerm,
    isCreateModalOpen,
    handleOpenCreateModal,
    handleCloseCreateModal,
    newlyCreatedKey,
    handleKeyCreated,
    handleCloseTokenDisplay,
    keyToRevoke,
    handleRequestRevoke,
    handleCancelRevoke,
    handleConfirmRevoke,
    isRevoking,
    keyToDelete,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
    isDeleting,
  } = useApiKeys();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <WorkspaceHeader
        title={API_KEYS_MESSAGES.TITLE}
        subtitle={API_KEYS_MESSAGES.SUBTITLE}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<VpnKeyOutlinedIcon fontSize="small" />}
            onClick={handleOpenCreateModal}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              borderRadius: 0,
            }}
          >
            {API_KEYS_MESSAGES.GENERATE_BUTTON}
          </Button>
        }
      />

      {/* Info Banner for MCP Integration */}
      <Paper
        sx={{
          borderRadius: 0,
          boxShadow: 'none',
          border: '1.5px solid',
          borderColor: 'divider',
          padding: 2,
          backgroundColor: 'action.hover',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TerminalOutlinedIcon fontSize="small" color="primary" />
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // MCP_ENDPOINT_CONFIG
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
          Connect Cursor, Claude Desktop, or autonomous agents using the SSE endpoint:{' '}
          <strong>{window.location.origin}/mcp/sse</strong> with your generated API token in the{' '}
          <code>Authorization: Bearer &lt;token&gt;</code> header.
        </Typography>
      </Paper>

      {/* Filter / Meta bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label={`// ${totalCount} KEYS_CONFIGURED`}
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
          placeholder={API_KEYS_MESSAGES.FILTER_PLACEHOLDER}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              sx: {
                borderRadius: 0,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                backgroundColor: 'background.paper',
              },
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
        <ApiKeysTable
          keys={keys}
          onRevoke={handleRequestRevoke}
          onDelete={handleRequestDelete}
        />
      )}

      {/* Modals */}
      <CreateApiKeyModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleKeyCreated}
      />

      <TokenDisplayModal
        open={Boolean(newlyCreatedKey)}
        rawKey={newlyCreatedKey?.rawKey || null}
        keyName={newlyCreatedKey?.name || ''}
        onClose={handleCloseTokenDisplay}
      />

      {/* Digital Brutalist Confirmation: Revoke */}
      <ConfirmModal
        open={Boolean(keyToRevoke)}
        title={keyToRevoke ? API_KEYS_MESSAGES.REVOKE_CONFIRM_TITLE(keyToRevoke.name) : ''}
        description={keyToRevoke ? API_KEYS_MESSAGES.REVOKE_CONFIRM_DESC(keyToRevoke.name) : ''}
        confirmLabel="REVOKE KEY"
        isLoading={isRevoking}
        onConfirm={handleConfirmRevoke}
        onClose={handleCancelRevoke}
      />

      {/* Digital Brutalist Confirmation: Delete */}
      <ConfirmModal
        open={Boolean(keyToDelete)}
        title={keyToDelete ? API_KEYS_MESSAGES.DELETE_CONFIRM_TITLE(keyToDelete.name) : ''}
        description={keyToDelete ? API_KEYS_MESSAGES.DELETE_CONFIRM_DESC(keyToDelete.name) : ''}
        confirmLabel="DELETE RECORD"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />
    </Box>
  );
};
