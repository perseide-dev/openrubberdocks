import React, { useState } from 'react';
import {
    Alert,
    Box,
    TextField,
    Typography,
    Button,
    FormControlLabel,
    Checkbox,
    Chip,
    Paper,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import { BlockEditor } from '@features-workspaces/files/components/BlockEditor';
import { IconPickerPopover } from '@features-workspaces/files/components/IconPickerPopover';
import { CoverPickerPopover } from '@features-workspaces/files/components/CoverPickerPopover';
import { TemplateSelectorModal } from '@features-workspaces/files/components/TemplateSelectorModal';
import { formatBytes } from '@features-workspaces/files/utils/table-markdown.utils';
import { getCoverStyle } from '@utils-functions/media.utils';
import type { FileEditorProps } from '@features-workspaces/files/types/file.types';

export const FileEditor: React.FC<FileEditorProps> = ({
    title,
    errorMessage,
    blockEditor,
    storageQuota,
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
                <Alert severity="error" variant="filled">
                    {errorMessage}
                </Alert>
            )}

            {coverImage && (
                <Paper
                    variant="outlined"
                    sx={{
                        position: 'relative',
                        height: 180,
                        width: '100%',
                        ...getCoverStyle(coverImage),
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        padding: 1.5,
                        '&:hover .cover-controls': {
                            opacity: 1,
                        },
                    }}
                >
                    <Paper
                        variant="outlined"
                        className="cover-controls"
                        sx={{
                            display: 'flex',
                            gap: 1,
                            opacity: { xs: 1, md: 0 },
                            padding: 0.5,
                        }}
                    >
                        <Button
                            size="small"
                            variant="text"
                            startIcon={<EditOutlinedIcon fontSize="small" />}
                            onClick={(e) => setCoverAnchor(e.currentTarget)}
                        >
                            CHANGE COVER
                        </Button>
                        <Button
                            size="small"
                            variant="text"
                            color="error"
                            startIcon={<DeleteOutlinedIcon fontSize="small" />}
                            onClick={() => onCoverChange?.(null)}
                        >
                            REMOVE
                        </Button>
                    </Paper>
                </Paper>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        {icon ? (
                            <Paper
                                variant="outlined"
                                onClick={(e) => setIconAnchor(e.currentTarget)}
                                sx={{
                                    width: 52,
                                    height: 52,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                }}
                                title="Change Icon"
                            >
                                {icon}
                            </Paper>
                        ) : (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<MoodOutlinedIcon fontSize="small" />}
                                onClick={(e) => setIconAnchor(e.currentTarget)}
                            >
                                + ADD ICON
                            </Button>
                        )}

                        {!coverImage && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddPhotoAlternateOutlinedIcon fontSize="small" />}
                                onClick={(e) => setCoverAnchor(e.currentTarget)}
                            >
                                + ADD COVER
                            </Button>
                        )}

                        {onApplyTemplate && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AutoAwesomeOutlinedIcon fontSize="small" />}
                                onClick={() => setTemplateModalOpen(true)}
                            >
                                + USE TEMPLATE
                            </Button>
                        )}

                        {storageQuota && (
                            <Chip
                                size="small"
                                variant="outlined"
                                icon={<StorageOutlinedIcon fontSize="small" />}
                                label={`// STORAGE (${storageQuota.driver.toUpperCase()}): ${formatBytes(
                                    storageQuota.usedBytes,
                                )} / ${formatBytes(storageQuota.quotaBytes)} (${
                                    storageQuota.usagePercent
                                }%)`}
                            />
                        )}
                    </Box>

                    {onToggleTemplate && (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isTemplate}
                                    onChange={(e) => onToggleTemplate(e.target.checked)}
                                    size="small"
                                />
                            }
                            label={
                                <Typography
                                    variant="caption"
                                    color={isTemplate ? 'primary' : 'text.secondary'}
                                >
                                    // WORKSPACE TEMPLATE
                                </Typography>
                            }
                        />
                    )}
                </Box>

                <TextField
                    id="file-title-input"
                    label="// FILE TITLE"
                    placeholder="Untitled"
                    value={title}
                    onChange={onTitleChange}
                    fullWidth
                    autoFocus
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="overline" color="text.secondary">
                    // CONTENT_BLOCKS ({blockEditor.blocks.length})
                </Typography>
                <BlockEditor blockEditor={blockEditor} />
            </Box>

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
