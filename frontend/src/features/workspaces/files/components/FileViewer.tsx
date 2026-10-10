import type { ReactNode } from 'react';
import { Box, Checkbox, Divider, Typography } from '@mui/material';
import type { BlockType, WorkspaceBlock } from '@features/workspaces/files/types/block.types';

interface FileViewerProps {
    blocks: WorkspaceBlock[];
}

interface BlockProperties {
    text?: unknown;
    checked?: unknown;
}

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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box
                sx={{
                    minWidth: 18,
                    fontFamily: '"Space Mono", monospace',
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    color: 'text.secondary',
                    userSelect: 'none',
                }}
            >
                {prefix}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
        </Box>
    );
}

export function FileViewer({ blocks }: FileViewerProps) {
    const sorted = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {sorted.map((block, index) => {
                if (block.type === 'divider') {
                    return <Divider key={block.uuid} sx={{ marginY: 1.5 }} />;
                }

                let numberedCounter = 0;
                let currentIndex = index;
                while (currentIndex >= 0 && sorted[currentIndex].type === 'numbered_list') {
                    currentIndex -= 1;
                    numberedCounter += 1;
                }
                const number = block.type === 'numbered_list' ? numberedCounter : undefined;

                const text = getTextFromProperties(block.properties);

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
                        <Box key={block.uuid} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                            <Checkbox
                                size="small"
                                checked={checked}
                                disabled
                                sx={{ marginTop: 0.25, padding: 0, '& .MuiSvgIcon-root': { fontSize: '1.125rem' } }}
                            />
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        ...getViewSx(block.type),
                                        textDecoration: checked ? 'line-through' : 'none',
                                        opacity: checked ? 0.6 : 1,
                                    }}
                                >
                                    {text}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }

                if (block.type === 'quote') {
                    return (
                        <Box key={block.uuid} sx={{ borderLeft: '3px solid', borderColor: 'divider', paddingLeft: 2 }}>
                            <Typography sx={{ ...getViewSx(block.type) }}>{text}</Typography>
                        </Box>
                    );
                }

                if (block.type === 'code') {
                    return (
                        <Box
                            key={block.uuid}
                            sx={{
                                backgroundColor: '#F0F0F0',
                                border: '1.5px solid',
                                borderColor: 'divider',
                                padding: 1.5,
                            }}
                        >
                            <Typography sx={{ ...getViewSx(block.type) }}>{text}</Typography>
                        </Box>
                    );
                }

                if (block.type === 'image') {
                    return (
                        <Box key={block.uuid} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {text.trim() !== '' && (
                                <Box
                                    component="img"
                                    src={text.trim()}
                                    alt=""
                                    sx={{
                                        maxWidth: '100%',
                                        border: '1.5px solid',
                                        borderColor: 'divider',
                                    }}
                                />
                            )}
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
    );
}