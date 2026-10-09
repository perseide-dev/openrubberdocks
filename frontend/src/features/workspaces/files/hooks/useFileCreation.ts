import { useState, useCallback, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFileService } from '@features/workspaces/files/services/file.service';
import { useCreateBlockService } from '@features/workspaces/files/services/block.service';
import { useBlockEditor } from '@features/workspaces/files/hooks/useBlockEditor';
import { FILE_MESSAGES } from '@features/workspaces/files/constants/file.constants';
import type { AppError } from '@http-error/http-error.handler';

/**
 * Orchestrates the file creation flow: title, block canvas and persistence of
 * the file followed by each of its blocks.
 */
export function useFileCreation(workspaceUuid: string) {
    const navigate = useNavigate();
    const createFileMutation = useCreateFileService();
    const createBlockMutation = useCreateBlockService();
    const blockEditor = useBlockEditor();

    const [title, setTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setErrorMessage(null);
    }, []);

    const handleSave = useCallback(async () => {
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setErrorMessage(FILE_MESSAGES.TITLE_REQUIRED);
            return;
        }

        setErrorMessage(null);

        try {
            const file = await createFileMutation.mutateAsync({
                workspaceUuid,
                title: trimmedTitle,
            });

            const blocks = blockEditor.blocks;
            for (let index = 0; index < blocks.length; index += 1) {
                const block = blocks[index];
                await createBlockMutation.mutateAsync({
                    fileUuid: file.uuid,
                    type: block.type,
                    properties: { text: block.content },
                    orderIndex: index,
                });
            }

            blockEditor.reset();
            navigate(`/workspaces/${workspaceUuid}`);
        } catch (err) {
            const appError = err as AppError;
            const errorDetail =
                appError?.errors?.[0]?.detail ||
                appError?.errors?.[0]?.title ||
                appError?.message ||
                FILE_MESSAGES.CREATE_ERROR;

            setErrorMessage(errorDetail);
        }
    }, [title, workspaceUuid, createFileMutation, createBlockMutation, blockEditor, navigate]);

    return {
        title,
        errorMessage,
        isSaving: createFileMutation.isPending || createBlockMutation.isPending,
        blockEditor,
        handleTitleChange,
        handleSave,
    };
}
