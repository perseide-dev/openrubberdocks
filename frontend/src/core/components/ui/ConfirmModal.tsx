import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { ConfirmModalProps } from '@components/ui/types/modal.types';

/**
 * Reusable Digital Brutalist confirmation modal for destructive operations.
 * Enforces 90° geometry, high contrast technical typography, and clear intent confirmation.
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'DELETE',
  cancelLabel = 'CANCEL',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 0,
            boxShadow: 'none !important',
            border: '2px solid',
            borderColor: 'divider',
            padding: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ paddingBottom: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" fontSize="small" />
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'error.main',
            }}
          >
            // CONFIRMATION_REQUIRED
          </Typography>
        </Box>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginTop: 0.5,
          }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ paddingTop: 1 }}>
        {typeof description === 'string' ? (
          <DialogContentText sx={{ color: 'text.secondary' }}>
            {description}
          </DialogContentText>
        ) : (
          description
        )}
      </DialogContent>

      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'PROCESSING...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
