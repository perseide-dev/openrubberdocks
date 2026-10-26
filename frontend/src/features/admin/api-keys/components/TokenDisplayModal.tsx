import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { API_KEYS_MESSAGES } from '@features/admin/api-keys/constants/api-keys.constants';
import type { TokenDisplayModalProps } from '@features/admin/api-keys/types/api-keys.types';

export const TokenDisplayModal: React.FC<TokenDisplayModalProps> = ({
  open,
  rawKey,
  keyName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (rawKey) {
      await navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            {API_KEYS_MESSAGES.TOKEN_CREATED_TITLE}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 0.5 }}>
          Key: <strong>{keyName}</strong>
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
        <Alert
          severity="warning"
          sx={{
            borderRadius: 0,
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            border: '1.5px solid',
            borderColor: 'warning.main',
          }}
        >
          {API_KEYS_MESSAGES.TOKEN_CREATED_WARNING}
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
            // PERSONAL_ACCESS_TOKEN
          </Typography>
          <TextField
            size="small"
            value={rawKey || ''}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                sx: {
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  backgroundColor: 'action.hover',
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopy} size="small" edge="end">
                      {copied ? (
                        <CheckOutlinedIcon color="success" fontSize="small" />
                      ) : (
                        <ContentCopyOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCopy}
          startIcon={copied ? <CheckOutlinedIcon /> : <ContentCopyOutlinedIcon />}
          sx={{ borderRadius: 0, fontFamily: 'monospace', fontWeight: 700 }}
        >
          {copied ? 'COPIED!' : 'COPY TOKEN'}
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ borderRadius: 0, fontFamily: 'monospace' }}
        >
          I HAVE SAVED IT
        </Button>
      </DialogActions>
    </Dialog>
  );
};
