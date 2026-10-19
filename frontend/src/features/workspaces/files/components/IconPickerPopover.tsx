import React, { useState } from 'react';
import {
  Popover,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { BRUTALIST_ICON_PRESETS } from '@features-workspaces/files/constants/media.constants';
import type { IconPickerPopoverProps } from '@features-workspaces/files/types/file.types';

export const IconPickerPopover: React.FC<IconPickerPopoverProps> = ({
  anchorEl,
  currentIcon,
  onClose,
  onSelectIcon,
}) => {
  const [customInput, setCustomInput] = useState('');

  const handleApplyCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed) {
      onSelectIcon(trimmed);
      setCustomInput('');
      onClose();
    }
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 290,
            padding: 2,
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 0,
            boxShadow: 'none',
            backgroundColor: 'background.paper',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography
          variant="overline"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'text.secondary',
            lineHeight: 1,
          }}
        >
          // CHOOSE_ICON
        </Typography>

        {/* Presets Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 0.75,
          }}
        >
          {BRUTALIST_ICON_PRESETS.map((preset) => {
            const isSelected = currentIcon === preset.icon;
            return (
              <IconButton
                key={preset.id}
                size="small"
                onClick={() => {
                  onSelectIcon(preset.icon);
                  onClose();
                }}
                sx={{
                  border: '1.5px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  backgroundColor: isSelected ? 'action.selected' : 'transparent',
                  borderRadius: 0,
                  fontSize: '1.25rem',
                  padding: 0.5,
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
                title={preset.label}
              >
                {preset.icon}
              </IconButton>
            );
          })}
        </Box>

        <Divider sx={{ marginY: 0.5 }} />

        {/* Custom Input */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Emoji or URL..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyCustom();
              }
            }}
            fullWidth
            slotProps={{
              input: {
                sx: {
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  borderRadius: 0,
                },
              },
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={handleApplyCustom}
            disabled={!customInput.trim()}
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 0,
            }}
          >
            SET
          </Button>
        </Box>

        {/* Remove Icon Action */}
        {currentIcon && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlinedIcon fontSize="small" />}
            onClick={() => {
              onSelectIcon(null);
              onClose();
            }}
            fullWidth
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: 0,
            }}
          >
            REMOVE ICON
          </Button>
        )}
      </Box>
    </Popover>
  );
};
