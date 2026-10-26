import { useState, useCallback, useMemo, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateFileService, useWorkspaceFilesService } from '@features-workspaces/files/services/file.service';
import { useCreateBlockService, fetchFileBlocks } from '@features-workspaces/files/services/block.service';
import { useBlockEditor } from '@features-workspaces/files/hooks/useBlockEditor';
import { FILE_MESSAGES } from '@features-workspaces/files/constants/file.constants';
import {
    loadDraft,
    saveDraft,
    clearDraft,
} from '@features-workspaces/files/utils/draft-storage.utils';
import type { AppError } from '@http-error/http-error.handler';
import type { BuiltInTemplate, WorkspaceFile } from '@features-workspaces/files/types/file.types';

/**
 * Orchestrates the file creation flow: title, media (icon/cover), templates,
 * block canvas and persistence of the file followed by each of its blocks.
 */
export function useFileCreation(workspaceUuid: string, draftId: string = 'new') {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const parentPageUuid = searchParams.get('parent') || undefined;

    const createFileMutation = useCreateFileService();
    const createBlockMutation = useCreateBlockService();
    const { data: workspaceFiles = [] } = useWorkspaceFilesService(workspaceUuid);

    const parentFile = useMemo(() => {
        if (!parentPageUuid) return undefined;
        return workspaceFiles.find((f) => f.uuid === parentPageUuid);
    }, [workspaceFiles, parentPageUuid]);

    const workspaceTemplates = useMemo(() => {
        return workspaceFiles.filter((f) => f.isTemplate);
    }, [workspaceFiles]);

    const [title, setTitle] = useState(() => loadDraft(workspaceUuid, draftId)?.title || '');
    const [icon, setIcon] = useState<string | null>(() => loadDraft(workspaceUuid, draftId)?.icon || null);
    const [coverImage, setCoverImage] = useState<string | null>(() => loadDraft(workspaceUuid, draftId)?.coverImage || null);
    const [isTemplate, setIsTemplate] = useState<boolean>(() => Boolean(loadDraft(workspaceUuid, draftId)?.isTemplate));
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [initialDraftBlocks] = useState(() => loadDraft(workspaceUuid, draftId)?.blocks);
    const blockEditor = useBlockEditor(initialDraftBlocks);

    const activeDraftIdRef = useRef(draftId);
    const isSwitchingDraftRef = useRef(false);

    useEffect(() => {
        if (activeDraftIdRef.current !== draftId) {
            isSwitchingDraftRef.current = true;
            activeDraftIdRef.current = draftId;

            const draft = loadDraft(workspaceUuid, draftId);
            setTitle(draft?.title || '');
            setIcon(draft?.icon || null);
            setCoverImage(draft?.coverImage || null);
            setIsTemplate(Boolean(draft?.isTemplate));
            blockEditor.setBlocksState(draft?.blocks || []);
        }
    }, [draftId, workspaceUuid, blockEditor]);

    const isInitialMount = useRef(true);

    // Save draft on change
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (isSwitchingDraftRef.current) {
            isSwitchingDraftRef.current = false;
            return;
        }

        if (activeDraftIdRef.current !== draftId) {
            return;
        }

        // Only save draft if there is meaningful content
        if (title.trim() || blockEditor.blocks.length > 0 || icon || coverImage) {
            saveDraft(workspaceUuid, draftId, {
                title,
                icon,
                coverImage,
                isTemplate,
                blocks: blockEditor.blocks,
                updatedAt: Date.now(),
            });
        }
    }, [title, icon, coverImage, isTemplate, blockEditor.blocks, workspaceUuid, draftId]);

    const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        setErrorMessage(null);
    }, []);

    const handleApplyTemplate = useCallback(async (template: BuiltInTemplate | WorkspaceFile) => {
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
                parentPageUuid,
                icon: icon || undefined,
                coverImage: coverImage || undefined,
                isTemplate,
            });

            const blocks = blockEditor.blocks;
            for (let index = 0; index < blocks.length; index += 1) {
                const block = blocks[index];
                await createBlockMutation.mutateAsync({
                    fileUuid: file.uuid,
                    type: block.type,
                    properties:
                        block.type === 'todo'
                            ? { text: block.content, checked: Boolean(block.checked) }
                            : { text: block.content },
                    orderIndex: index,
                });
            }

            clearDraft(workspaceUuid, draftId);
            blockEditor.reset();
            navigate(`/workspaces/${workspaceUuid}/files/${file.uuid}`);
        } catch (err) {
            const appError = err as AppError;
            const errorDetail =
                appError?.errors?.[0]?.detail ||
                appError?.errors?.[0]?.title ||
                appError?.message ||
                FILE_MESSAGES.CREATE_ERROR;

            setErrorMessage(errorDetail);
        }
    }, [title, workspaceUuid, parentPageUuid, icon, coverImage, isTemplate, draftId, createFileMutation, createBlockMutation, blockEditor, navigate]);

    // Ctrl+S / Cmd+S shortcut
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
        isSaving: createFileMutation.isPending || createBlockMutation.isPending,
        blockEditor,
        parentFile,
        parentPageUuid,
        workspaceFiles,
        workspaceTemplates,
        handleTitleChange,
        setIcon,
        setCoverImage,
        setIsTemplate,
        handleApplyTemplate,
        handleSave,
    };
}
