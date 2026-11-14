import { useState, useCallback, useMemo, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    useCreateFileService,
    useWorkspaceFilesService,
} from '@features-workspaces/files/services/file.service';
import { useWorkspaceDetailService } from '@features-workspaces/manager/services/workspace.service';
import {
    useSyncFileBlocksService,
    useFetchFileBlocksService,
} from '@features-workspaces/files/services/block.service';
import {
    useUploadStorageAttachmentService,
    useWorkspaceStorageQuotaService,
    useWorkspaceTasksMentionsService,
} from '@features-workspaces/files/services/storage.service';
import { storageRepository } from '@features-workspaces/files/repositories/storage.repository';
import { useBlockEditor } from '@features-workspaces/files/hooks/useBlockEditor';
import { FILE_MESSAGES } from '@features-workspaces/files/constants/file.constants';
import {
    loadDraft,
    saveDraft,
    clearDraft,
} from '@features-workspaces/files/utils/draft-storage.utils';
import { getFriendlyErrorMessage } from '@http-error/http-error.handler';
import type { UploadedBinaryDescriptor } from '@features-workspaces/files/types/block.types';
import type { BuiltInTemplate, WorkspaceFile } from '@features-workspaces/files/types/file.types';
import type { InternalLinkCandidate } from '@features-workspaces/files/types/storage.types';

export function useFileCreationPageData(workspaceUuid: string) {
    const { data: workspace } = useWorkspaceDetailService(workspaceUuid);
    const { data: workspaceFiles = [] } = useWorkspaceFilesService(workspaceUuid);

    return {
        workspace,
        workspaceFiles,
    };
}

export function useFileCreation(workspaceUuid: string, draftId: string = 'new') {
    const navigate = useNavigate();
    const fetchBlocksByFile = useFetchFileBlocksService();
    const [searchParams] = useSearchParams();
    const parentPageUuid = searchParams.get('parent') || undefined;

    const createFileMutation = useCreateFileService();
    const syncBlocksMutation = useSyncFileBlocksService();
    const uploadAttachmentMutation = useUploadStorageAttachmentService();
    const { data: workspaceFiles = [] } = useWorkspaceFilesService(workspaceUuid);
    const { data: workspaceTasks = [] } = useWorkspaceTasksMentionsService(workspaceUuid);
    const { data: storageQuota } = useWorkspaceStorageQuotaService(workspaceUuid);

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
        [uploadAttachmentMutation, workspaceUuid],
    );

    const parentFile = useMemo(() => {
        if (!parentPageUuid) return undefined;
        return workspaceFiles.find((f) => f.uuid === parentPageUuid);
    }, [workspaceFiles, parentPageUuid]);

    const workspaceTemplates = useMemo(() => {
        return workspaceFiles.filter((f) => f.isTemplate);
    }, [workspaceFiles]);

    const [title, setTitle] = useState(() => loadDraft(workspaceUuid, draftId)?.title || '');
    const [icon, setIcon] = useState<string | null>(
        () => loadDraft(workspaceUuid, draftId)?.icon || null,
    );
    const [coverImage, setCoverImage] = useState<string | null>(
        () => loadDraft(workspaceUuid, draftId)?.coverImage || null,
    );
    const [isTemplate, setIsTemplate] = useState<boolean>(() =>
        Boolean(loadDraft(workspaceUuid, draftId)?.isTemplate),
    );

    const [initialDraftBlocks] = useState(() => loadDraft(workspaceUuid, draftId)?.blocks);
    const blockEditor = useBlockEditor(initialDraftBlocks, {
        workspaceUuid,
        mentionCandidates,
        isUploadingBinary: uploadAttachmentMutation.isPending,
        onUploadFile: handleUploadBinaryFile,
    });

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

    const handleApplyTemplate = useCallback(
        async (template: BuiltInTemplate | WorkspaceFile) => {
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
            if (blocks.length > 0) {
                await syncBlocksMutation.mutateAsync({
                    fileUuid: file.uuid,
                    payload: {
                        blocks: blocks.map((block, index) => ({
                            type: block.type,
                            properties: {
                                ...(block.properties ?? {}),
                                text: block.content,
                                ...(block.type === 'todo'
                                    ? { checked: Boolean(block.checked) }
                                    : {}),
                            },
                            orderIndex: index,
                        })),
                    },
                });
            }

            clearDraft(workspaceUuid, draftId);
            blockEditor.reset();
            navigate(`/workspaces/${workspaceUuid}/files/${file.uuid}`);
        } catch (err) {
            setErrorMessage(
                getFriendlyErrorMessage(err, FILE_MESSAGES.CREATE_ERROR),
            );
        }
    }, [
        title,
        workspaceUuid,
        parentPageUuid,
        icon,
        coverImage,
        isTemplate,
        draftId,
        createFileMutation,
        syncBlocksMutation,
        blockEditor,
        navigate,
    ]);

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
        storageQuota: storageQuota ?? null,
        errorMessage,
        isSaving: createFileMutation.isPending || syncBlocksMutation.isPending,
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
