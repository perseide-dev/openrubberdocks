import React, { useState } from 'react';
import {
  Popover,
  Box,
  Typography,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { BRUTALIST_COVER_PRESETS } from '@features-workspaces/files/constants/media.constants';
import type { CoverPickerPopoverProps } from '@features-workspaces/files/types/file.types';

export const CoverPickerPopover: React.FC<CoverPickerPopoverProps> = ({
  anchorEl,
  currentCover,
  onClose,
  onSelectCover,
}) => {
  const [customUrl, setCustomUrl] = useState('');

  const handleApplyCustom = () => {
    const trimmed = customUrl.trim();
    if (trimmed) {
      onSelectCover(trimmed);
      setCustomUrl('');
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
            width: 340,
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
          // CHOOSE_COVER
        </Typography>

        {/* Presets Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
          }}
        >
          {BRUTALIST_COVER_PRESETS.map((preset) => {
            const isSelected = currentCover === preset.url;
            return (
              <Box
                key={preset.id}
                onClick={() => {
                  onSelectCover(preset.url);
                  onClose();
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1.5px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  sx={{
                    height: 48,
                    backgroundImage: `url("${preset.url}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: preset.previewColor,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <Box sx={{ padding: 0.5, backgroundColor: 'action.hover' }}>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      display: 'block',
                      color: isSelected ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {preset.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ marginY: 0.5 }} />

        {/* Custom URL Input */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Paste image URL (https://...)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
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
            disabled={!customUrl.trim()}
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

        {/* Remove Cover Action */}
        {currentCover && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteOutlinedIcon fontSize="small" />}
            onClick={() => {
              onSelectCover(null);
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
            REMOVE COVER
          </Button>
        )}
      </Box>
    </Popover>
  );
};
