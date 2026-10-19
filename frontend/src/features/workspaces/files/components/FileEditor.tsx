import React, { useState } from 'react';
import {
  Alert,
  Box,
  TextField,
  Typography,
  Button,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { BlockEditor } from '@features-workspaces/files/components/BlockEditor';
import { IconPickerPopover } from '@features-workspaces/files/components/IconPickerPopover';
import { CoverPickerPopover } from '@features-workspaces/files/components/CoverPickerPopover';
import { TemplateSelectorModal } from '@features-workspaces/files/components/TemplateSelectorModal';
import { getCoverStyle } from '@utils-functions/media.utils';
import type { FileEditorProps } from '@features-workspaces/files/types/file.types';

export const FileEditor: React.FC<FileEditorProps> = ({
  title,
  errorMessage,
  blockEditor,
  icon,
  coverImage,
  isTemplate = false,
  workspaceTemplates = [],
  onTitleChange,
  onIconChange,
  onCoverChange,
  onToggleTemplate,
  onApplyTemplate,
}) => {
  const [iconAnchor, setIconAnchor] = useState<HTMLElement | null>(null);
  const [coverAnchor, setCoverAnchor] = useState<HTMLElement | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {errorMessage && (
        <Alert severity="error" variant="filled" sx={{ borderRadius: 0 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Cover Image Banner (if set) */}
      {coverImage && (
        <Box
          sx={{
            position: 'relative',
            height: 180,
            width: '100%',
            ...getCoverStyle(coverImage),
            border: '2px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: 1.5,
            '&:hover .cover-controls': {
              opacity: 1,
            },
          }}
        >
          <Box
            className="cover-controls"
            sx={{
              display: 'flex',
              gap: 1,
              opacity: { xs: 1, md: 0 },
              transition: 'opacity 0.2s',
              backgroundColor: 'background.paper',
              padding: 0.5,
              border: '1.5px solid',
              borderColor: 'divider',
            }}
          >
            <Button
              size="small"
              variant="text"
              startIcon={<EditOutlinedIcon fontSize="small" />}
              onClick={(e) => setCoverAnchor(e.currentTarget)}
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: 0,
              }}
            >
              CHANGE COVER
            </Button>
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<DeleteOutlinedIcon fontSize="small" />}
              onClick={() => onCoverChange?.(null)}
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: 0,
              }}
            >
              REMOVE
            </Button>
          </Box>
        </Box>
      )}

      {/* Header controls: Icon badge, Floating Actions & Template Toggle */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Row with Icon Badge & Quick Add Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Icon Badge or Add Icon button */}
            {icon ? (
              <Box
                onClick={(e) => setIconAnchor(e.currentTarget)}
                sx={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  border: '2px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'border-color 0.15s, transform 0.1s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)',
                  },
                }}
                title="Change Icon"
              >
                {icon}
              </Box>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<MoodOutlinedIcon fontSize="small" />}
                onClick={(e) => setIconAnchor(e.currentTarget)}
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  borderRadius: 0,
                }}
              >
                + ADD ICON
              </Button>
            )}

            {/* Add Cover Button (if not already set) */}
            {!coverImage && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddPhotoAlternateOutlinedIcon fontSize="small" />}
                onClick={(e) => setCoverAnchor(e.currentTarget)}
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  borderRadius: 0,
                }}
              >
                + ADD COVER
              </Button>
            )}

            {/* Use Template Button */}
            {onApplyTemplate && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoAwesomeOutlinedIcon fontSize="small" />}
                onClick={() => setTemplateModalOpen(true)}
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  borderRadius: 0,
                }}
              >
                + USE TEMPLATE
              </Button>
            )}
          </Box>

          {/* Template checkbox toggle */}
          {onToggleTemplate && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isTemplate}
                  onChange={(e) => onToggleTemplate(e.target.checked)}
                  size="small"
                  sx={{ borderRadius: 0 }}
                />
              }
              label={
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: isTemplate ? 'primary.main' : 'text.secondary',
                  }}
                >
                  // WORKSPACE TEMPLATE
                </Typography>
              }
            />
          )}
        </Box>

        {/* Title Input */}
        <TextField
          id="file-title-input"
          label="// FILE TITLE"
          placeholder="Untitled"
          value={title}
          onChange={onTitleChange}
          fullWidth
          autoFocus
          slotProps={{
            input: {
              sx: {
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '1.25rem',
                borderRadius: 0,
              },
            },
          }}
        />
      </Box>

      {/* Blocks Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}
        >
          // CONTENT_BLOCKS ({blockEditor.blocks.length})
        </Typography>
        <BlockEditor blockEditor={blockEditor} />
      </Box>

      {/* Popovers and Modals */}
      <IconPickerPopover
        anchorEl={iconAnchor}
        currentIcon={icon}
        onClose={() => setIconAnchor(null)}
        onSelectIcon={(newIcon) => onIconChange?.(newIcon)}
      />

      <CoverPickerPopover
        anchorEl={coverAnchor}
        currentCover={coverImage}
        onClose={() => setCoverAnchor(null)}
        onSelectCover={(newCover) => onCoverChange?.(newCover)}
      />

      {onApplyTemplate && (
        <TemplateSelectorModal
          open={templateModalOpen}
          workspaceTemplates={workspaceTemplates}
          onClose={() => setTemplateModalOpen(false)}
          onSelectTemplate={(template) => onApplyTemplate(template)}
        />
      )}
    </Box>
  );
};
