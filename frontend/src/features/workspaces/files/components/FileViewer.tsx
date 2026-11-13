import type { ReactNode } from 'react';
import { Box, Checkbox, Chip, Divider, Paper, Typography } from '@mui/material';
import type {
    BlockType,
    BlockProperties,
    FileEditorBlock,
} from '@features-workspaces/files/types/block.types';
import type { FileViewerProps } from '@features-workspaces/files/types/file.types';
import { getCoverStyle } from '@utils-functions/media.utils';
import { AttachmentBlockView } from '@features-workspaces/files/components/blocks/AttachmentBlockView';
import { TableBlockView } from '@features-workspaces/files/components/blocks/TableBlockView';
import { CalloutBlockView } from '@features-workspaces/files/components/blocks/CalloutBlockView';
import { MermaidBlockView } from '@features-workspaces/files/components/blocks/MermaidBlockView';
import { OpenApiBlockView } from '@features-workspaces/files/components/blocks/OpenApiBlockView';
import { InternalLinkBlockView } from '@features-workspaces/files/components/blocks/InternalLinkBlockView';

function getTextFromProperties(props: Record<string, unknown> | null): string {
    if (!props) return '';
    const text = (props as BlockProperties).text;
    return typeof text === 'string' ? text : '';
}

function getCheckedFromProperties(props: Record<string, unknown> | null): boolean {
    if (!props) return false;
    const checked = (props as BlockProperties).checked;
    return typeof checked === 'boolean' ? checked : false;
}

function getViewSx(type: BlockType) {
    switch (type) {
        case 'heading_1':
            return { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 };
        case 'heading_2':
            return { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25 };
        case 'heading_3':
            return { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 };
        case 'code':
            return {
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap' as const,
            };
        case 'quote':
            return { fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic' };
        default:
            return { fontSize: '1rem', lineHeight: 1.6 };
    }
}

function PrefixRow({ prefix, children }: { prefix: string; children: ReactNode }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
                sx={{
                    minWidth: 18,
                    fontFamily: '"Space Mono", monospace',
                    fontSize: '1rem',
                    lineHeight: 1,
                    color: 'text.secondary',
                    userSelect: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                {prefix}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                {children}
            </Box>
        </Box>
    );
}

export function FileViewer({
    blocks,
    workspaceUuid,
    title,
    icon,
    coverImage,
    isTemplate,
}: FileViewerProps) {
    const sorted = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {coverImage && (
                <Paper
                    variant="outlined"
                    sx={{
                        width: '100%',
                        height: 180,
                        ...getCoverStyle(coverImage),
                    }}
                />
            )}

            {(icon || isTemplate) && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        marginTop: coverImage ? -5 : 0,
                        paddingX: coverImage ? 2 : 0,
                        marginBottom: 1,
                        zIndex: 1,
                    }}
                >
                    {icon ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                width: 56,
                                height: 56,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.25rem',
                                userSelect: 'none',
                            }}
                        >
                            {icon}
                        </Paper>
                    ) : (
                        <Box />
                    )}

                    {isTemplate && (
                        <Chip
                            label="// WORKSPACE TEMPLATE"
                            size="small"
                            variant="outlined"
                            color="primary"
                        />
                    )}
                </Box>
            )}

            {title && (
                <Typography variant="h4" sx={{ marginBottom: 1 }}>
                    {title}
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {sorted.map((block, index) => {
                    if (block.type === 'divider') {
                        return <Divider key={block.uuid} sx={{ marginY: 1.5 }} />;
                    }

                    const text = getTextFromProperties(block.properties);
                    const editorShape: FileEditorBlock = {
                        id: block.uuid,
                        type: block.type,
                        content: text,
                        checked: getCheckedFromProperties(block.properties),
                        properties: block.properties ?? undefined,
                    };

                    if (block.type === 'image' || block.type === 'file_attachment') {
                        return <AttachmentBlockView key={block.uuid} block={editorShape} readOnly />;
                    }

                    if (block.type === 'table') {
                        return <TableBlockView key={block.uuid} block={editorShape} readOnly />;
                    }

                    if (block.type === 'callout') {
                        return <CalloutBlockView key={block.uuid} block={editorShape} readOnly />;
                    }

                    if (block.type === 'mermaid') {
                        return <MermaidBlockView key={block.uuid} block={editorShape} readOnly />;
                    }

                    if (block.type === 'openapi_spec') {
                        return <OpenApiBlockView key={block.uuid} block={editorShape} readOnly />;
                    }

                    if (block.type === 'internal_link') {
                        return (
                            <InternalLinkBlockView
                                key={block.uuid}
                                block={editorShape}
                                workspaceUuid={workspaceUuid}
                                readOnly
                            />
                        );
                    }

                    let numberedCounter = 0;
                    let currentIndex = index;
                    while (currentIndex >= 0) {
                        if (sorted[currentIndex].type === 'numbered_list') {
                            numberedCounter += 1;
                            currentIndex -= 1;
                        } else if (
                            sorted[currentIndex].type === 'text' &&
                            getTextFromProperties(sorted[currentIndex].properties).trim() === ''
                        ) {
                            currentIndex -= 1;
                        } else {
                            break;
                        }
                    }
                    const number = block.type === 'numbered_list' ? numberedCounter : undefined;

                    if (block.type === 'bullet_list') {
                        return (
                            <PrefixRow key={block.uuid} prefix="•">
                                <Typography sx={{ ...getViewSx(block.type) }}>{text}</Typography>
                            </PrefixRow>
                        );
                    }

                    if (block.type === 'numbered_list') {
                        return (
                            <PrefixRow key={block.uuid} prefix={`${number ?? 1}.`}>
                                <Typography sx={{ ...getViewSx(block.type) }}>{text}</Typography>
                            </PrefixRow>
                        );
                    }

                    if (block.type === 'todo') {
                        const checked = getCheckedFromProperties(block.properties);
                        return (
                            <Box
                                key={block.uuid}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                <Checkbox checked={checked} disabled sx={{ padding: 0.5 }} />
                                <Typography
                                    sx={{
                                        ...getViewSx(block.type),
                                        textDecoration: checked ? 'line-through' : 'none',
                                        color: checked ? 'text.secondary' : 'inherit',
                                    }}
                                >
                                    {text}
                                </Typography>
                            </Box>
                        );
                    }

                    return (
                        <Typography key={block.uuid} sx={{ ...getViewSx(block.type) }}>
                            {text}
                        </Typography>
                    );
                })}
            </Box>
        </Box>
    );
}
