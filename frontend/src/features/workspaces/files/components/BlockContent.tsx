import { useCallback } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Box, Checkbox, Divider, InputBase } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { BLOCK_CONTENT_PLACEHOLDERS } from '@features-workspaces/files/constants/block.constants';
import type { BlockType, BlockContentProps } from '@features-workspaces/files/types/block.types';
import { AttachmentBlockView } from '@features-workspaces/files/components/blocks/AttachmentBlockView';
import { TableBlockView } from '@features-workspaces/files/components/blocks/TableBlockView';
import { CalloutBlockView } from '@features-workspaces/files/components/blocks/CalloutBlockView';
import { MermaidBlockView } from '@features-workspaces/files/components/blocks/MermaidBlockView';
import { OpenApiBlockView } from '@features-workspaces/files/components/blocks/OpenApiBlockView';
import { InternalLinkBlockView } from '@features-workspaces/files/components/blocks/InternalLinkBlockView';

const sharedInput: SxProps<Theme> = {
    p: 0,
    '&::placeholder': { color: 'text.disabled', opacity: 1 },
};

function getInputSx(type: BlockType): SxProps<Theme> {
    switch (type) {
        case 'heading_1':
            return { ...sharedInput, fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 };
        case 'heading_2':
            return { ...sharedInput, fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25 };
        case 'heading_3':
            return { ...sharedInput, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 };
        case 'code':
            return {
                ...sharedInput,
                fontFamily: '"Space Mono", monospace',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
            };
        case 'quote':
            return { ...sharedInput, fontSize: '1.05rem', lineHeight: 1.5, fontStyle: 'italic' };
        default:
            return { ...sharedInput, fontSize: '1rem', lineHeight: 1.5 };
    }
}

function PrefixRow({ prefix, children }: { prefix: string; children: ReactNode }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
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

export function BlockContent({
    block,
    number,
    inputRef,
    onChange,
    onUpdateProperties,
    onUploadBinary,
    isUploadingBinary,
    mentionCandidates,
    workspaceUuid,
    onKeyDown,
    onPaste,
    onToggleChecked,
}: BlockContentProps) {
    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange(event.target.value),
        [onChange],
    );

    if (block.type === 'divider') {
        return <Divider sx={{ marginY: 1.5 }} />;
    }

    if (block.type === 'image' || block.type === 'file_attachment') {
        return (
            <AttachmentBlockView
                block={block}
                isUploadingBinary={isUploadingBinary}
                onChangeContent={onChange}
                onUpdateProperties={onUpdateProperties}
                onUploadBinary={onUploadBinary}
            />
        );
    }

    if (block.type === 'table') {
        return (
            <TableBlockView
                block={block}
                onChangeContent={onChange}
                onUpdateProperties={onUpdateProperties}
            />
        );
    }

    if (block.type === 'callout') {
        return (
            <CalloutBlockView
                block={block}
                onChangeContent={onChange}
                onUpdateProperties={onUpdateProperties}
            />
        );
    }

    if (block.type === 'mermaid') {
        return (
            <MermaidBlockView
                block={block}
                onChangeContent={onChange}
                onUpdateProperties={onUpdateProperties}
            />
        );
    }

    if (block.type === 'openapi_spec') {
        return (
            <OpenApiBlockView
                block={block}
                onChangeContent={onChange}
                onUpdateProperties={onUpdateProperties}
            />
        );
    }

    if (block.type === 'internal_link') {
        return (
            <InternalLinkBlockView
                block={block}
                workspaceUuid={workspaceUuid}
                mentionCandidates={mentionCandidates}
                onChangeContent={onChange}
                onUpdateProperties={onUpdateProperties}
            />
        );
    }

    const editor = (
        <InputBase
            multiline
            fullWidth
            inputRef={inputRef}
            value={block.content}
            placeholder={BLOCK_CONTENT_PLACEHOLDERS[block.type]}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            sx={{
                width: '100%',
                fontFamily: '"Space Grotesk", sans-serif',
                color: 'text.primary',
                '& .MuiInputBase-input': {
                    ...(getInputSx(block.type) as object),
                    padding: 0,
                    lineHeight: 1.5,
                },
            }}
        />
    );

    if (block.type === 'bullet_list') {
        return <PrefixRow prefix="•">{editor}</PrefixRow>;
    }

    if (block.type === 'numbered_list') {
        return <PrefixRow prefix={`${number ?? 1}.`}>{editor}</PrefixRow>;
    }

    if (block.type === 'todo') {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Checkbox
                    size="small"
                    checked={Boolean(block.checked)}
                    onChange={onToggleChecked}
                    sx={{ padding: 0, '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }}
                />
                <Box
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        textDecoration: block.checked ? 'line-through' : 'none',
                        opacity: block.checked ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {editor}
                </Box>
            </Box>
        );
    }

    if (block.type === 'quote') {
        return (
            <Box sx={{ paddingLeft: 2, display: 'flex', alignItems: 'center' }}>
                {editor}
            </Box>
        );
    }

    if (block.type === 'code') {
        return (
            <Box sx={{ padding: 1.5, display: 'flex', alignItems: 'center' }}>
                {editor}
            </Box>
        );
    }

    return editor;
}
