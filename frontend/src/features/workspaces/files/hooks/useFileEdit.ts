import { useState, useCallback, useEffect, useRef, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useFileDetailService,
    useUpdateFileService,
    useWorkspaceFilesService,
} from '@features-workspaces/files/services/file.service';
import { useWorkspaceDetailService } from '@features-workspaces/manager/services/workspace.service';
import {
    useFileBlocksService,
    useSyncFileBlocksService,
    useFetchFileBlocksService,
} from '@features-workspaces/files/services/block.service';
import { useCreateFileRevisionService } from '@features-workspaces/files/services/revision.service';
import {
    useUploadStorageAttachmentService,
    useWorkspaceStorageQuotaService,
    useWorkspaceTasksMentionsService,
} from '@features-workspaces/files/services/storage.service';
import { storageRepository } from '@features-workspaces/files/repositories/storage.repository';
import { useBlockEditor } from '@features-workspaces/files/hooks/useBlockEditor';
import {
    FILE_MESSAGES,
    AUTOSAVE_DELAY_MS,
} from '@features-workspaces/files/constants/file.constants';
import { files } from '@features-workspaces/files/routes/routes';
import {
    loadDraft,
    saveDraft,
    clearDraft,
    getAutosavePreference,
    setAutosavePreference,
} from '@features-workspaces/files/utils/draft-storage.utils';
import { getFriendlyErrorMessage } from '@http-error/http-error.handler';
import type {
    FileEditorBlock,
    UploadedBinaryDescriptor,
    WorkspaceBlock,
} from '@features-workspaces/files/types/block.types';
import type {
    AutosaveStatus,
    BuiltInTemplate,
    WorkspaceFile,
} from '@features-workspaces/files/types/file.types';
import type { InternalLinkCandidate } from '@features-workspaces/files/types/storage.types';

function mapBlockToEditor(block: WorkspaceBlock): FileEditorBlock {
    const props = (block.properties ?? {}) as Record<string, unknown>;
    const text = typeof props.text === 'string' ? props.text : '';
    const checked =
        block.type === 'todo' && typeof props.checked === 'boolean'
            ? props.checked
            : undefined;
    return {
        id: block.uuid,
        type: block.type,
        content: text,
        checked,
        properties: props,
    };
}

export function useFileEditPageData(workspaceUuid: string, fileUuid: string) {
    const { data: file } = useFileDetailService(fileUuid);
    const { data: allFiles = [] } = useWorkspaceFilesService(workspaceUuid);
    const { data: workspace } = useWorkspaceDetailService(workspaceUuid);

    return {
        file,
        allFiles,
        workspace,
    };
}

export function useFileEdit(workspaceUuid: string, fileUuid: string) {
    const navigate = useNavigate();
    const fetchBlocksByFile = useFetchFileBlocksService();
    const { data: file, isLoading: isFileLoading } = useFileDetailService(fileUuid);
    const { data: serverBlocks, isLoading: isBlocksLoading } = useFileBlocksService(fileUuid);
    const { data: workspaceFiles = [] } = useWorkspaceFilesService(workspaceUuid);
    const { data: workspaceTasks = [] } = useWorkspaceTasksMentionsService(workspaceUuid);
    const { data: storageQuota } = useWorkspaceStorageQuotaService(workspaceUuid);
    const uploadAttachmentMutation = useUploadStorageAttachmentService();
    const updateFileMutation = useUpdateFileService();
    const syncBlocksMutation = useSyncFileBlocksService();
    const createRevisionMutation = useCreateFileRevisionService();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const mentionCandidates = useMemo<InternalLinkCandidate[]>(() => {
        const docCandidates: InternalLinkCandidate[] = workspaceFiles.map((f) => ({
            targetType: 'document',
            targetUuid: f.uuid,
            targetTitle: f.title || 'Untitled',
            subtitle: 'Workspace Document',
        }));
        const taskCandidates: InternalLinkCandidate[] = workspaceTasks.map((t) => ({
            targetType: 'task',
            targetUuid: t.uuid,
            targetTitle: t.title,
            projectUuid: t.projectUuid,
            subtitle: t.status?.name ? `Task • ${t.status.name}` : 'Workspace Task',
        }));
        return [...docCandidates, ...taskCandidates];
    }, [workspaceFiles, workspaceTasks]);

    const handleUploadBinaryFile = useCallback(
        async (binaryFile: File): Promise<UploadedBinaryDescriptor> => {
            try {
                const attachment = await uploadAttachmentMutation.mutateAsync({
                    workspaceUuid,
                    fileUuid,
                    file: binaryFile,
                });
                const url = storageRepository.buildAttachmentContentUrl(attachment.uuid);
                return {
                    url,
                    attachmentMeta: {
                        attachmentUuid: attachment.uuid,
                        originalName: attachment.originalName,
                        mimeType: attachment.mimeType,
                        sizeBytes: attachment.sizeBytes,
                        url,
                    },
                };
            } catch (err) {
                setErrorMessage(
                    getFriendlyErrorMessage(err, 'Binary upload failed.'),
                );
                throw err;
            }
        },
        [uploadAttachmentMutation, workspaceUuid, fileUuid],
    );

    const blockEditor = useBlockEditor(undefined, {
        workspaceUuid,
        mentionCandidates,
        isUploadingBinary: uploadAttachmentMutation.isPending,
        onUploadFile: handleUploadBinaryFile,
    });

    const workspaceTemplates = useMemo(() => {
        return workspaceFiles.filter((f) => f.isTemplate);
    }, [workspaceFiles]);

    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isTemplate, setIsTemplate] = useState<boolean>(false);
    const [isDraftRestored, setIsDraftRestored] = useState(false);
    const [isUserDirty, setIsUserDirty] = useState(false);
    const [isManualSaving, setIsManualSaving] = useState(false);

    const [autosaveEnabled, setAutosaveEnabled] = useState(getAutosavePreference);
    const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('saved');

    const isHydratedRef = useRef(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const isPersistingRef = useRef(false);
    const activePersistPromiseRef = useRef<Promise<boolean> | null>(null);

    const toggleAutosave = useCallback((enabled: boolean) => {
        setAutosaveEnabled(enabled);
        setAutosavePreference(enabled);
    }, []);

    useEffect(() => {
        if (!file || !serverBlocks || isHydratedRef.current) return;
        isHydratedRef.current = true;

        queueMicrotask(() => {
            const draft = loadDraft(workspaceUuid, fileUuid);
            const serverUpdatedAt = new Date(file.updatedAt).getTime();
            const isDraftNewer = Boolean(draft && draft.updatedAt > serverUpdatedAt);

            const resolvedTitle =
                isDraftNewer && draft?.title?.trim() ? draft.title : file.title || '';
            const resolvedIcon =
                isDraftNewer && draft?.icon !== undefined ? draft.icon : file.icon || null;
            const resolvedCover =
                isDraftNewer && draft?.coverImage !== undefined
                    ? draft.coverImage
                    : file.coverImage || null;
            const resolvedTemplate = isDraftNewer
                ? Boolean(draft?.isTemplate)
                : Boolean(file.isTemplate);

            setTitle(resolvedTitle);
            setIcon(resolvedIcon);
            setCoverImage(resolvedCover);
            setIsTemplate(resolvedTemplate);

            const hasValidDraftBlocks =
                isDraftNewer && draft?.blocks && draft.blocks.length > 0;
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
    }, [
        title,
        icon,
        coverImage,
        isTemplate,
        blockEditor.blocks,
        blockEditor.canUndo,
        isUserDirty,
        isDraftRestored,
        workspaceUuid,
        fileUuid,
        file,
    ]);

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

    const handleApplyTemplate = useCallback(
        async (template: BuiltInTemplate | WorkspaceFile) => {
            setIsUserDirty(true);
            setAutosaveStatus('unsaved');
            if ('blocks' in template && Array.isArray(template.blocks)) {
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
                const fileTmpl = template as WorkspaceFile;
                setTitle(`${fileTmpl.title} (Template Copy)`);
                setIcon(fileTmpl.icon || null);
                setCoverImage(fileTmpl.coverImage || null);
                try {
                    const blocks = await fetchBlocksByFile(fileTmpl.uuid);
                    blockEditor.reset();
                    const sorted = [...blocks].sort((a, b) => a.orderIndex - b.orderIndex);
                    sorted.forEach((b) => {
                        const props = (b.properties ?? {}) as Record<string, unknown>;
                        const id = blockEditor.addBlock(b.type, undefined, props);
                        const text = typeof props.text === 'string' ? props.text : '';
                        const checked =
                            typeof props.checked === 'boolean' ? props.checked : false;
                        blockEditor.updateBlock(id, text, props);
                        if (b.type === 'todo' && checked) {
                            blockEditor.toggleChecked(id);
                        }
                    });
                } catch {
                    // Keep empty blocks if template blocks couldn't be loaded
                }
            }
        },
        [blockEditor, fetchBlocksByFile],
    );

    const persistFile = useCallback(async () => {
        if (isPersistingRef.current) return false;
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setErrorMessage(FILE_MESSAGES.TITLE_REQUIRED);
            return false;
        }
        setErrorMessage(null);

        isPersistingRef.current = true;
        const promise = (async () => {
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

                const editorBlocks = blockEditor.blocks;
                await syncBlocksMutation.mutateAsync({
                    fileUuid,
                    payload: {
                        blocks: editorBlocks.map((b, i) => ({
                            type: b.type,
                            properties: {
                                ...(b.properties ?? {}),
                                text: b.content,
                                ...(b.type === 'todo' ? { checked: Boolean(b.checked) } : {}),
                            },
                            orderIndex: i,
                        })),
                    },
                });

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
                activePersistPromiseRef.current = null;
            }
        })();

        activePersistPromiseRef.current = promise;
        return promise;
    }, [
        title,
        icon,
        coverImage,
        isTemplate,
        file,
        blockEditor.blocks,
        updateFileMutation,
        syncBlocksMutation,
        createRevisionMutation,
        workspaceUuid,
        fileUuid,
    ]);

    const handleSave = useCallback(async () => {
        setIsManualSaving(true);
        try {
            if (activePersistPromiseRef.current) {
                try {
                    await activePersistPromiseRef.current;
                } catch {
                    // Ignore in-flight autosave failure and retry immediately
                }
            }
            const success = await persistFile();
            if (success) {
                navigate(files.view.build(workspaceUuid, fileUuid));
            }
        } catch (err) {
            setErrorMessage(
                getFriendlyErrorMessage(err, FILE_MESSAGES.CREATE_ERROR),
            );
            setAutosaveStatus('unsaved');
        } finally {
            setIsManualSaving(false);
        }
    }, [persistFile, navigate, workspaceUuid, fileUuid]);

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
        }, AUTOSAVE_DELAY_MS);

        return () => clearTimeout(timer);
    }, [autosaveEnabled, autosaveStatus, persistFile, file]);

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
        storageQuota: storageQuota ?? null,
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
