import React, { useState } from 'react';
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
import { useCreateApiKeyService } from '@features/admin/api-keys/services/api-keys.service';
import { API_KEYS_MESSAGES } from '@features/admin/api-keys/constants/api-keys.constants';
import type { CreateApiKeyModalProps } from '@features/admin/api-keys/types/api-keys.types';

export const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<string>('30');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateApiKeyService();

  const handleClose = () => {
    if (createMutation.isPending) return;
    setName('');
    setExpiresInDays('30');
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Token name is required.');
      return;
    }

    try {
      setErrorMessage(null);
      const days = expiresInDays.trim() ? parseInt(expiresInDays, 10) : undefined;
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        expiresInDays: days && !isNaN(days) ? days : undefined,
      });

      if (result.rawKey) {
        onSuccess(result.rawKey, result.name);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create API key');
      }
    }
  };

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
              disabled={createMutation.isPending}
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
              disabled={createMutation.isPending}
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
            disabled={createMutation.isPending}
            sx={{ borderRadius: 0, fontFamily: 'monospace' }}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={createMutation.isPending}
            startIcon={createMutation.isPending ? <CircularProgress size={16} /> : undefined}
            sx={{ borderRadius: 0, fontFamily: 'monospace', fontWeight: 700 }}
          >
            GENERATE KEY
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
