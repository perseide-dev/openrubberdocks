import { useRef, type DragEvent, type ChangeEvent } from 'react';
import {
    Box,
    Button,
    Chip,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { sanitizeImageUrl } from '@utils-functions/media.utils';
import { formatBytes } from '@features-workspaces/files/utils/table-markdown.utils';
import type {
    AttachmentBlockMeta,
    RichBlockSharedProps,
} from '@features-workspaces/files/types/block.types';

export function AttachmentBlockView({
    block,
    readOnly = false,
    isUploadingBinary = false,
    onChangeContent,
    onUpdateProperties,
    onUploadBinary,
}: RichBlockSharedProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const isImageBlock = block.type === 'image';
    const attachmentMeta = (block.properties?.attachment ?? {}) as AttachmentBlockMeta;
    const rawUrl = (attachmentMeta.url || block.content || '').trim();
    const safeImageUrl = isImageBlock ? sanitizeImageUrl(rawUrl) : null;

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        if (readOnly) return;
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return;
        event.preventDefault();
        event.stopPropagation();
        const file = files[0];
        if (file && onUploadBinary) {
            void onUploadBinary(file, isImageBlock ? 'image' : 'file_attachment');
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (readOnly) return;
        if (event.dataTransfer?.types?.includes('Files')) {
            event.preventDefault();
        }
    };

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onUploadBinary) {
            void onUploadBinary(file, isImageBlock ? 'image' : 'file_attachment');
        }
        event.target.value = '';
    };

    const handleCaptionChange = (event: ChangeEvent<HTMLInputElement>) => {
        onUpdateProperties?.({
            attachment: {
                ...attachmentMeta,
                caption: event.target.value,
            },
        });
    };

    return (
        <Paper
            variant="outlined"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                padding: 1.5,
                width: '100%',
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={isImageBlock ? 'image/*' : '*/*'}
                hidden
                onChange={handleFileSelect}
            />

            {!readOnly && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            size="small"
                            variant="outlined"
                            icon={
                                isImageBlock ? (
                                    <ImageOutlinedIcon fontSize="small" />
                                ) : (
                                    <AttachFileOutlinedIcon fontSize="small" />
                                )
                            }
                            label={isImageBlock ? '// BLOCK: IMAGE' : '// BLOCK: FILE_ATTACHMENT'}
                        />
                        {attachmentMeta.sizeBytes ? (
                            <Chip
                                size="small"
                                variant="outlined"
                                label={formatBytes(attachmentMeta.sizeBytes)}
                            />
                        ) : null}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<UploadFileOutlinedIcon fontSize="small" />}
                            disabled={isUploadingBinary}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploadingBinary
                                ? 'UPLOADING...'
                                : isImageBlock
                                ? 'UPLOAD / DROP IMAGE'
                                : 'UPLOAD / DROP BINARY'}
                        </Button>
                    </Box>
                </Box>
            )}

            {!readOnly && isImageBlock && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        fullWidth
                        label="// IMAGE URL OR STORAGE STREAM PATH"
                        placeholder="Drop or paste an image from clipboard, or enter https://..."
                        value={block.content}
                        onChange={(e) => onChangeContent?.(e.target.value)}
                    />
                    <TextField
                        size="small"
                        fullWidth
                        label="// TECHNICAL CAPTION"
                        placeholder="Optional architecture diagram or UI capture caption..."
                        value={attachmentMeta.caption ?? ''}
                        onChange={handleCaptionChange}
                    />
                </Box>
            )}

            {isImageBlock && safeImageUrl && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    <Box
                        component="img"
                        src={safeImageUrl}
                        alt={attachmentMeta.caption || attachmentMeta.originalName || ''}
                        sx={{ maxWidth: '100%', height: 'auto', alignSelf: 'flex-start' }}
                    />
                    {attachmentMeta.caption && (
                        <Typography variant="caption" color="text.secondary">
                            // FIG: {attachmentMeta.caption}
                        </Typography>
                    )}
                </Box>
            )}

            {!isImageBlock && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <Typography variant="subtitle2">
                            {attachmentMeta.originalName ||
                                (rawUrl ? rawUrl.split('/').pop() : '// NO_BINARY_ATTACHED (DROP OR PASTE FILE)')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {attachmentMeta.mimeType || 'application/octet-stream'}
                            {attachmentMeta.sizeBytes
                                ? ` • ${formatBytes(attachmentMeta.sizeBytes)}`
                                : ''}
                        </Typography>
                    </Box>

                    {rawUrl && (
                        <Button
                            size="small"
                            variant="outlined"
                            component="a"
                            href={rawUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DownloadOutlinedIcon fontSize="small" />}
                        >
                            DOWNLOAD BINARY
                        </Button>
                    )}
                </Box>
            )}
        </Paper>
    );
}
