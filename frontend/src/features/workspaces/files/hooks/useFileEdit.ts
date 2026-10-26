import { useState, useCallback, useEffect, useRef, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useFileDetailService, useUpdateFileService, useWorkspaceFilesService } from '@features-workspaces/files/services/file.service';
import {
    useFileBlocksService,
    useCreateBlockService,
    useDeleteBlockService,
    fetchFileBlocks,
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
import type { AutosaveStatus, BuiltInTemplate, WorkspaceFile } from '@features-workspaces/files/types/file.types';

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
    const queryClient = useQueryClient();
    const { data: file, isLoading: isFileLoading } = useFileDetailService(fileUuid);
    const { data: serverBlocks, isLoading: isBlocksLoading } = useFileBlocksService(fileUuid);
    const { data: workspaceFiles = [] } = useWorkspaceFilesService(workspaceUuid);
    const updateFileMutation = useUpdateFileService();
    const createBlockMutation = useCreateBlockService();
    const deleteBlockMutation = useDeleteBlockService();
    const createRevisionMutation = useCreateFileRevisionService();
    const blockEditor = useBlockEditor();

    const workspaceTemplates = useMemo(() => {
        return workspaceFiles.filter((f) => f.isTemplate);
    }, [workspaceFiles]);

    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isTemplate, setIsTemplate] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDraftRestored, setIsDraftRestored] = useState(false);
    const [isUserDirty, setIsUserDirty] = useState(false);
    const [isManualSaving, setIsManualSaving] = useState(false);

    // Autosave settings & status
    const [autosaveEnabled, setAutosaveEnabled] = useState(getAutosavePreference);
    const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('saved');

    const isHydratedRef = useRef(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const isPersistingRef = useRef(false);

    const toggleAutosave = useCallback((enabled: boolean) => {
        setAutosaveEnabled(enabled);
        setAutosavePreference(enabled);
    }, []);

    // Hydrate editor state exactly ONCE when both file and serverBlocks are loaded
    useEffect(() => {
        if (!file || !serverBlocks || isHydratedRef.current) return;
        isHydratedRef.current = true;

        queueMicrotask(() => {
            const draft = loadDraft(workspaceUuid, fileUuid);
            const serverUpdatedAt = new Date(file.updatedAt).getTime();
            const isDraftNewer = Boolean(draft && draft.updatedAt > serverUpdatedAt);

            const resolvedTitle = (isDraftNewer && draft?.title?.trim()) ? draft.title : (file.title || '');
            const resolvedIcon = (isDraftNewer && draft?.icon !== undefined) ? draft.icon : (file.icon || null);
            const resolvedCover = (isDraftNewer && draft?.coverImage !== undefined) ? draft.coverImage : (file.coverImage || null);
            const resolvedTemplate = isDraftNewer ? Boolean(draft?.isTemplate) : Boolean(file.isTemplate);

            setTitle(resolvedTitle);
            setIcon(resolvedIcon);
            setCoverImage(resolvedCover);
            setIsTemplate(resolvedTemplate);

            const hasValidDraftBlocks = isDraftNewer && draft?.blocks && draft.blocks.length > 0;
            if (hasValidDraftBlocks) {
                blockEditor.setBlocksState(draft.blocks);
                setIsDraftRestored(true);
                setAutosaveStatus('unsaved');
                setIsUserDirty(true);
            } else {
                const sorted = [...serverBlocks].sort((a, b) => a.orderIndex - b.orderIndex);
                blockEditor.setBlocksState(sorted.map(mapBlockToEditor));
                setAutosaveStatus('saved');
            }
            setIsHydrated(true);
        });
    }, [file, serverBlocks, workspaceUuid, fileUuid, blockEditor]);

    // Save draft to localStorage only when user actually makes changes after hydration
    useEffect(() => {
        if (!file || !isHydratedRef.current || isPersistingRef.current) return;
        if (!isUserDirty && !blockEditor.canUndo && !isDraftRestored) return;

        saveDraft(workspaceUuid, fileUuid, {
            title,
            icon,
            coverImage,
            isTemplate,
            blocks: blockEditor.blocks,
            updatedAt: Date.now(),
        });
    }, [title, icon, coverImage, isTemplate, blockEditor.blocks, blockEditor.canUndo, isUserDirty, isDraftRestored, workspaceUuid, fileUuid, file]);

    const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setIsUserDirty(true);
        setAutosaveStatus('unsaved');
        setTitle(e.target.value);
        setErrorMessage(null);
    }, []);

    const handleSetIcon = useCallback((newIcon: string | null) => {
        setIsUserDirty(true);
        setAutosaveStatus('unsaved');
        setIcon(newIcon);
    }, []);

    const handleSetCoverImage = useCallback((newCover: string | null) => {
        setIsUserDirty(true);
        setAutosaveStatus('unsaved');
        setCoverImage(newCover);
    }, []);

    const handleSetIsTemplate = useCallback((val: boolean) => {
        setIsUserDirty(true);
        setAutosaveStatus('unsaved');
        setIsTemplate(val);
    }, []);

    const handleApplyTemplate = useCallback(async (template: BuiltInTemplate | WorkspaceFile) => {
        setIsUserDirty(true);
        setAutosaveStatus('unsaved');
        if ('blocks' in template && Array.isArray(template.blocks)) {
            // Built-in system preset
            setTitle(template.title);
            setIcon(template.icon);
            setCoverImage(template.coverImage);
            blockEditor.reset();
            template.blocks.forEach((b) => {
                const id = blockEditor.addBlock(b.type);
                blockEditor.updateBlock(id, b.content);
                if (b.type === 'todo' && b.checked) {
                    blockEditor.toggleChecked(id);
                }
            });
        } else {
            // Workspace template file
            const fileTmpl = template as WorkspaceFile;
            setTitle(`${fileTmpl.title} (Template Copy)`);
            setIcon(fileTmpl.icon || null);
            setCoverImage(fileTmpl.coverImage || null);
            try {
                const blocks = await fetchFileBlocks(queryClient, fileTmpl.uuid);
                blockEditor.reset();
                const sorted = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
                sorted.forEach((b) => {
                    const id = blockEditor.addBlock(b.type);
                    const props = (b.properties ?? {}) as Record<string, unknown>;
                    const text = typeof props.text === 'string' ? props.text : '';
                    const checked = typeof props.checked === 'boolean' ? props.checked : false;
                    blockEditor.updateBlock(id, text);
                    if (b.type === 'todo' && checked) {
                        blockEditor.toggleChecked(id);
                    }
                });
            } catch {
                // Keep empty blocks if template blocks couldn't be loaded
            }
        }
    }, [blockEditor, queryClient]);

    const persistFile = useCallback(async () => {
        if (isPersistingRef.current) return false;
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setErrorMessage(FILE_MESSAGES.TITLE_REQUIRED);
            return false;
        }
        setErrorMessage(null);

        isPersistingRef.current = true;
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

            const currentBlocks = serverBlocks || [];
            for (let i = 0; i < currentBlocks.length; i++) {
                await deleteBlockMutation.mutateAsync(currentBlocks[i].uuid);
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
            setIsUserDirty(false);
            setAutosaveStatus('saved');
            return true;
        } finally {
            isPersistingRef.current = false;
        }
    }, [
        title,
        icon,
        coverImage,
        isTemplate,
        file,
        serverBlocks,
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
        setIsManualSaving(true);
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
        } finally {
            setIsManualSaving(false);
        }
    }, [persistFile, navigate, workspaceUuid, fileUuid]);

    // Automatic background save (calm, debounced, non-blocking)
    useEffect(() => {
        if (!autosaveEnabled || !file) return;
        if (autosaveStatus !== 'unsaved') return;

        const timer = setTimeout(async () => {
            if (isPersistingRef.current) return;
            try {
                setAutosaveStatus('saving');
                await persistFile();
            } catch {
                setAutosaveStatus('unsaved');
            }
        }, 2500);

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
        isLoading: isFileLoading || isBlocksLoading || !isHydrated,
        title,
        icon,
        coverImage,
        isTemplate,
        workspaceTemplates,
        errorMessage,
        isSaving: isManualSaving,
        blockEditor,
        isDraftRestored,
        autosaveEnabled,
        autosaveStatus,
        toggleAutosave,
        handleTitleChange,
        setIcon: handleSetIcon,
        setCoverImage: handleSetCoverImage,
        setIsTemplate: handleSetIsTemplate,
        handleApplyTemplate,
        handleSave,
    };
}
