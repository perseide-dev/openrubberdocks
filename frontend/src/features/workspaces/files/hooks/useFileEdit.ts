import { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileDetailService, useUpdateFileService } from '@features-workspaces/files/services/file.service';
import {
    useFileBlocksService,
    useCreateBlockService,
    useDeleteBlockService,
} from '@features-workspaces/files/services/block.service';
import { useCreateFileRevisionService } from '@features-workspaces/files/services/revision.service';
import { useBlockEditor } from '@features-workspaces/files/hooks/useBlockEditor';
import { FILE_MESSAGES } from '@features-workspaces/files/constants/file.constants';
import { files } from '@features-workspaces/files/routes/routes';
import {
    loadDraft,
    saveDraft,
    clearDraft,
    getAutosavePreference,
    setAutosavePreference,
} from '@features-workspaces/files/utils/draft-storage.utils';
import type { AppError } from '@http-error/http-error.handler';
import type { WorkspaceBlock } from '@features-workspaces/files/types/block.types';
import type { AutosaveStatus } from '@features-workspaces/files/types/file.types';

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
    const createRevisionMutation = useCreateFileRevisionService();
    const blockEditor = useBlockEditor();

    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isTemplate, setIsTemplate] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDraftRestored, setIsDraftRestored] = useState(false);

    // Autosave settings & status
    const [autosaveEnabled, setAutosaveEnabled] = useState(getAutosavePreference);
    const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('saved');

    const hydratedKey = `${fileUuid}:${blocks.map((b) => b.uuid).join(',')}`;
    const lastHydratedKeyRef = useRef<string | null>(null);
    const lastFileRef = useRef<string | null>(null);
    const isInitialLoad = useRef(true);

    const toggleAutosave = useCallback((enabled: boolean) => {
        setAutosaveEnabled(enabled);
        setAutosavePreference(enabled);
    }, []);

    // Load file and check for newer cached draft
    useEffect(() => {
        if (file && lastFileRef.current !== file.uuid) {
            const draft = loadDraft(workspaceUuid, fileUuid);
            const serverUpdatedAt = new Date(file.updatedAt).getTime();

            if (draft && draft.updatedAt > serverUpdatedAt) {
                setTitle(draft.title);
                setIcon(draft.icon);
                setCoverImage(draft.coverImage);
                setIsTemplate(draft.isTemplate);
                blockEditor.setBlocksState(draft.blocks);
                setIsDraftRestored(true);
                setAutosaveStatus('unsaved');
            } else {
                setTitle(file.title || '');
                setIcon(file.icon || null);
                setCoverImage(file.coverImage || null);
                setIsTemplate(Boolean(file.isTemplate));
            }
            lastFileRef.current = file.uuid;
        }
    }, [file, workspaceUuid, fileUuid, blockEditor]);

    // Populate editor blocks from server if no draft restored
    useEffect(() => {
        if (!isDraftRestored && lastHydratedKeyRef.current !== hydratedKey) {
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
    }, [hydratedKey, blockEditor, blocks, isDraftRestored]);

    // Save draft to localStorage on any change
    useEffect(() => {
        if (!file) return;
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        setAutosaveStatus('unsaved');
        saveDraft(workspaceUuid, fileUuid, {
            title,
            icon,
            coverImage,
            isTemplate,
            blocks: blockEditor.blocks,
            updatedAt: Date.now(),
        });
    }, [title, icon, coverImage, isTemplate, blockEditor.blocks, workspaceUuid, fileUuid, file]);

    const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setErrorMessage(null);
    }, []);

    const persistFile = useCallback(async () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setErrorMessage(FILE_MESSAGES.TITLE_REQUIRED);
            return false;
        }
        setErrorMessage(null);

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

        try {
            await createRevisionMutation.mutateAsync(fileUuid);
        } catch {
            // Non-fatal if revision creation fails
        }

        clearDraft(workspaceUuid, fileUuid);
        setAutosaveStatus('saved');
        return true;
    }, [
        title,
        icon,
        coverImage,
        isTemplate,
        file,
        blocks,
        blockEditor.blocks,
        updateFileMutation,
        deleteBlockMutation,
        createBlockMutation,
        createRevisionMutation,
        workspaceUuid,
        fileUuid,
    ]);

    // Manual Save: persists and navigates to view
    const handleSave = useCallback(async () => {
        try {
            const success = await persistFile();
            if (success) {
                navigate(files.view.build(workspaceUuid, fileUuid));
            }
        } catch (err) {
            const appError = err as AppError;
            const errorDetail = appError?.errors?.[0]?.detail || appError?.message || FILE_MESSAGES.CREATE_ERROR;
            setErrorMessage(errorDetail);
            setAutosaveStatus('unsaved');
        }
    }, [persistFile, navigate, workspaceUuid, fileUuid]);

    // Automatic background save
    useEffect(() => {
        if (!autosaveEnabled || !file) return;
        if (autosaveStatus !== 'unsaved') return;

        const timer = setTimeout(async () => {
            try {
                setAutosaveStatus('saving');
                await persistFile();
            } catch {
                setAutosaveStatus('unsaved');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [autosaveEnabled, autosaveStatus, persistFile, file]);

    // Ctrl+S / Cmd+S shortcut to save immediately
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                void handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    return {
        title,
        icon,
        coverImage,
        isTemplate,
        errorMessage,
        isSaving:
            updateFileMutation.isPending ||
            createBlockMutation.isPending ||
            deleteBlockMutation.isPending ||
            createRevisionMutation.isPending ||
            autosaveStatus === 'saving',
        blockEditor,
        isDraftRestored,
        autosaveEnabled,
        autosaveStatus,
        toggleAutosave,
        handleTitleChange,
        setIcon,
        setCoverImage,
        setIsTemplate,
        handleSave,
    };
}
