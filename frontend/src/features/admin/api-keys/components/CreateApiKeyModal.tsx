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
  Alert,
  CircularProgress,
} from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { useCreateApiKeyModal } from '@features/admin/api-keys/hooks/useApiKeys';
import { API_KEYS_MESSAGES } from '@features/admin/api-keys/constants/api-keys.constants';
import type { CreateApiKeyModalProps } from '@features/admin/api-keys/types/api-keys.types';

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const {
    name,
    setName,
    expiresInDays,
    setExpiresInDays,
    errorMessage,
    isPending,
    handleClose,
    handleSubmit,
  } = useCreateApiKeyModal(onClose, onSuccess);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ paddingBottom: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VpnKeyOutlinedIcon color="primary" fontSize="small" />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: 'text.secondary',
              }}
            >
              {API_KEYS_MESSAGES.CREATE_KEY_TITLE}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.5 }}>
            {API_KEYS_MESSAGES.CREATE_KEY_DESC}
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              // KEY_NAME
            </Typography>
            <TextField
              size="small"
              placeholder="e.g. Cursor VPS Agent or Claude Desktop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
              fullWidth
              slotProps={{ input: { sx: { borderRadius: 0, fontFamily: 'monospace' } } }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              // EXPIRATION_DAYS (OPTIONAL, LEAVE EMPTY FOR NEVER)
            </Typography>
            <TextField
              size="small"
              type="number"
              placeholder="e.g. 30"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              disabled={isPending}
              fullWidth
              slotProps={{ input: { sx: { borderRadius: 0, fontFamily: 'monospace' } } }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={handleClose}
            disabled={isPending}
            sx={{ borderRadius: 0, fontFamily: 'monospace' }}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} /> : undefined}
            sx={{ borderRadius: 0, fontFamily: 'monospace', fontWeight: 700 }}
          >
            GENERATE KEY
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
