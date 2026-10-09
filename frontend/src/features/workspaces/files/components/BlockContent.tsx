import { useCallback } from 'react';
import type { KeyboardEvent, ChangeEvent, ReactNode } from 'react';
import { Box, Checkbox, Divider, InputBase } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { BLOCK_CONTENT_PLACEHOLDERS } from '@features/workspaces/files/constants/block.constants';
import type { BlockType, FileEditorBlock } from '@features/workspaces/files/types/block.types';

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
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      };
    case 'quote':
      return { ...sharedInput, fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic' };
    default:
      return { ...sharedInput, fontSize: '1rem', lineHeight: 1.6 };
  }
}

interface BlockContentProps {
  block: FileEditorBlock;
  number?: number;
  inputRef: (element: HTMLTextAreaElement | null) => void;
  onChange: (content: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleChecked: () => void;
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

export function BlockContent({
  block,
  number,
  inputRef,
  onChange,
  onKeyDown,
  onToggleChecked,
}: BlockContentProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
    [onChange]
  );

  if (block.type === 'divider') {
    return <Divider sx={{ marginY: 1.5 }} />;
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
      sx={{
        width: '100%',
        fontFamily: '"Space Grotesk", sans-serif',
        color: 'text.primary',
        '& .MuiInputBase-input': getInputSx(block.type) as SxProps<Theme>,
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
        <Checkbox
          size="small"
          checked={Boolean(block.checked)}
          onChange={onToggleChecked}
          sx={{ marginTop: 0.25 }}
        />
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            textDecoration: block.checked ? 'line-through' : 'none',
            opacity: block.checked ? 0.6 : 1,
          }}
        >
          {editor}
        </Box>
      </Box>
    );
  }

  if (block.type === 'quote') {
    return (
      <Box sx={{ borderLeft: '3px solid', borderColor: 'divider', paddingLeft: 2 }}>
        {editor}
      </Box>
    );
  }

  if (block.type === 'code') {
    return (
      <Box
        sx={{
          backgroundColor: '#F0F0F0',
          border: '1.5px solid',
          borderColor: 'divider',
          padding: 1.5,
        }}
      >
        {editor}
      </Box>
    );
  }

  if (block.type === 'image') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {editor}
        {block.content.trim() !== '' && (
          <Box
            component="img"
            src={block.content.trim()}
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

  return editor;
}
