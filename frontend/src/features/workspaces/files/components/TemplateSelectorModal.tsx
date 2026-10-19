import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { BUILT_IN_FILE_TEMPLATES } from '@features-workspaces/files/constants/media.constants';
import type {
  TemplateSelectorModalProps,
  BuiltInTemplate,
  WorkspaceFile,
} from '@features-workspaces/files/types/file.types';

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  open,
  workspaceTemplates,
  onClose,
  onSelectTemplate,
}) => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 0,
            boxShadow: 'none',
            backgroundColor: 'background.paper',
            padding: 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          marginBottom: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeOutlinedIcon sx={{ color: 'primary.main', fontSize: '1.25rem' }} />
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              fontSize: '1rem',
            }}
          >
            // SELECT_DOCUMENT_TEMPLATE
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tabIndex}
        onChange={(_, val) => setTabIndex(val)}
        sx={{
          borderBottom: '2px solid',
          borderColor: 'divider',
          marginBottom: 2.5,
          '& .MuiTab-root': {
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            borderRadius: 0,
          },
        }}
      >
        <Tab label={`// SYSTEM_PRESETS (${BUILT_IN_FILE_TEMPLATES.length})`} />
        <Tab label={`// WORKSPACE_TEMPLATES (${workspaceTemplates.length})`} />
      </Tabs>

      <DialogContent sx={{ padding: 0 }}>
        {tabIndex === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {BUILT_IN_FILE_TEMPLATES.map((tmpl: BuiltInTemplate) => (
              <Box
                key={tmpl.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 2,
                  border: '1.5px solid',
                  borderColor: 'divider',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0, marginRight: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      border: '1.5px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.default',
                      flexShrink: 0,
                    }}
                  >
                    {tmpl.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {tmpl.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {tmpl.description}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    fontSize: '0.75rem',
                    borderRadius: 0,
                    flexShrink: 0,
                  }}
                >
                  USE TEMPLATE
                </Button>
              </Box>
            ))}
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {workspaceTemplates.length === 0 ? (
              <Box
                sx={{
                  padding: 4,
                  border: '1.5px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    marginBottom: 0.5,
                  }}
                >
                  // NO_WORKSPACE_TEMPLATES_FOUND
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Mark any file as a template in the editor to make it reusable here.
                </Typography>
              </Box>
            ) : (
              workspaceTemplates.map((file: WorkspaceFile) => (
                <Box
                  key={file.uuid}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 2,
                    border: '1.5px solid',
                    borderColor: 'divider',
                    transition: 'border-color 0.15s, background-color 0.15s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0, marginRight: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        border: '1.5px solid',
                        borderColor: 'divider',
                        backgroundColor: 'background.default',
                        flexShrink: 0,
                      }}
                    >
                      {file.icon || <DescriptionOutlinedIcon fontSize="small" />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {file.title || 'UNTITLED_TEMPLATE'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        // UPDATED: {new Date(file.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      onSelectTemplate(file);
                      onClose();
                    }}
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      fontSize: '0.75rem',
                      borderRadius: 0,
                      flexShrink: 0,
                    }}
                  >
                    USE TEMPLATE
                  </Button>
                </Box>
              ))
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
