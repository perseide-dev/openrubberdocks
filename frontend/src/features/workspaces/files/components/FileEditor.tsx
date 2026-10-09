import { Alert, Box, TextField, Typography } from '@mui/material';
import { BlockEditor } from '@features/workspaces/files/components/BlockEditor';
import type { BlockEditorController } from '@features/workspaces/files/hooks/useBlockEditor';
import type { ChangeEvent } from 'react';

interface FileEditorProps {
    title: string;
    errorMessage: string | null;
    blockEditor: BlockEditorController;
    onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function FileEditor({ title, errorMessage, blockEditor, onTitleChange }: FileEditorProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {errorMessage && (
                <Alert severity="error" variant="filled">
                    {errorMessage}
                </Alert>
            )}

            <TextField
                id="file-title-input"
                label="// FILE TITLE"
                placeholder="Untitled"
                value={title}
                onChange={onTitleChange}
                fullWidth
                autoFocus
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    // BLOCKS
                </Typography>
                <BlockEditor blockEditor={blockEditor} />
            </Box>
        </Box>
    );
}
