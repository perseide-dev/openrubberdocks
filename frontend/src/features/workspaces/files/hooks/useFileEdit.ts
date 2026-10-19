import { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileDetailService, useUpdateFileService } from '@features-workspaces/files/services/file.service';
import {
    useFileBlocksService,
    useCreateBlockService,
    useDeleteBlockService,
} from '@features-workspaces/files/services/block.service';
import { useBlockEditor } from '@features-workspaces/files/hooks/useBlockEditor';
import { FILE_MESSAGES } from '@features-workspaces/files/constants/file.constants';
import { files } from '@features-workspaces/files/routes/routes';
import type { AppError } from '@http-error/http-error.handler';
import type { WorkspaceBlock } from '@features-workspaces/files/types/block.types';

function mapBlockToEditor(block: WorkspaceBlock) {
    const props = (block.properties ?? {}) as Record<string, unknown>;
    const text = typeof props.text === 'string' ? props.text : '';
    const checked = block.type === 'todo' && typeof props.checked === 'boolean' ? props.checked : undefined;
    return {
        id: block.uuid,
        type: block.type,
        content: text,
        checked,
    };
}

export function useFileEdit(workspaceUuid: string, fileUuid: string) {
    const navigate = useNavigate();
    const { data: file } = useFileDetailService(fileUuid);
    const { data: blocks = [] } = useFileBlocksService(fileUuid);
    const updateFileMutation = useUpdateFileService();
    const createBlockMutation = useCreateBlockService();
    const deleteBlockMutation = useDeleteBlockService();
    const blockEditor = useBlockEditor();

    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isTemplate, setIsTemplate] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const hydratedKey = `${fileUuid}:${blocks.map((b) => b.uuid).join(',')}`;
    const lastHydratedKeyRef = useRef<string | null>(null);
    const lastFileRef = useRef<string | null>(null);

    useEffect(() => {
        if (file && lastFileRef.current !== file.uuid) {
            setTitle(file.title || '');
            setIcon(file.icon || null);
            setCoverImage(file.coverImage || null);
            setIsTemplate(Boolean(file.isTemplate));
            lastFileRef.current = file.uuid;
        }
    }, [file]);

    useEffect(() => {
        if (lastHydratedKeyRef.current !== hydratedKey) {
            blockEditor.reset();
            const sorted = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
            sorted.forEach((b) => {
                const e = mapBlockToEditor(b);
                const id = blockEditor.addBlock(e.type);
                blockEditor.updateBlock(id, e.content);
                if (e.type === 'todo' && e.checked) {
                    blockEditor.toggleChecked(id);
                }
            });
            lastHydratedKeyRef.current = hydratedKey;
        }
    }, [hydratedKey, blockEditor, blocks]);

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
            if (file) {
                await updateFileMutation.mutateAsync({
                    uuid: file.uuid,
                    payload: {
                        title: trimmedTitle,
                        icon,
                        coverImage,
                        isTemplate,
                    },
                });
            }
            for (let i = 0; i < blocks.length; i++) {
                await deleteBlockMutation.mutateAsync(blocks[i].uuid);
            }
            const editorBlocks = blockEditor.blocks;
            for (let i = 0; i < editorBlocks.length; i++) {
                const b = editorBlocks[i];
                await createBlockMutation.mutateAsync({
                    fileUuid,
                    type: b.type,
                    properties: b.type === 'todo' ? { text: b.content, checked: Boolean(b.checked) } : { text: b.content },
                    orderIndex: i,
                });
            }
            navigate(files.view.build(workspaceUuid, fileUuid));
        } catch (err) {
            const appError = err as AppError;
            const errorDetail = appError?.errors?.[0]?.detail || appError?.message || FILE_MESSAGES.CREATE_ERROR;
            setErrorMessage(errorDetail);
        }
    }, [title, icon, coverImage, isTemplate, file, blocks, blockEditor.blocks, updateFileMutation, deleteBlockMutation, createBlockMutation, navigate, workspaceUuid, fileUuid]);

    return {
        title,
        icon,
        coverImage,
        isTemplate,
        errorMessage,
        isSaving: updateFileMutation.isPending || createBlockMutation.isPending || deleteBlockMutation.isPending,
        blockEditor,
        handleTitleChange,
        setIcon,
        setCoverImage,
        setIsTemplate,
        handleSave,
    };
}
