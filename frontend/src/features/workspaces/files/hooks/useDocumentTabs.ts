import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { files } from '@features-workspaces/files/routes/routes';
import { getStoredTabs, setStoredTabs, clearDraft } from '@features-workspaces/files/utils/draft-storage.utils';
import type { DocumentTab } from '@features-workspaces/files/types/file.types';

export function useDocumentTabs(workspaceUuid: string, currentFile?: { uuid: string; title: string; icon: string | null; isNew?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [tabs, setTabs] = useState<DocumentTab[]>(() => {
        if (!workspaceUuid) return [];
        return getStoredTabs(workspaceUuid);
    });

    const isFirstMount = useRef(true);

    // Sync tabs with current file being viewed/edited during render when props change
    const [prevFileKey, setPrevFileKey] = useState<string | null>(null);
    const currentKey = currentFile ? `${currentFile.uuid}:${currentFile.title}:${currentFile.icon}` : null;
    if (currentKey !== prevFileKey) {
        setPrevFileKey(currentKey);
        if (currentFile && currentFile.uuid) {
            setTabs((prev) => {
                const existingIndex = prev.findIndex((t) => t.uuid === currentFile.uuid);
                let updated: DocumentTab[];
                if (existingIndex >= 0) {
                    updated = prev.map((t, idx) =>
                        idx === existingIndex
                            ? { ...t, title: currentFile.title || t.title, icon: currentFile.icon ?? t.icon }
                            : t
                    );
                } else {
                    updated = [
                        ...prev,
                        {
                            uuid: currentFile.uuid,
                            title: currentFile.title || (currentFile.isNew ? 'Untitled Draft' : 'Untitled'),
                            icon: currentFile.icon,
                            isNew: currentFile.isNew,
                        },
                    ];
                }
                setStoredTabs(workspaceUuid, updated);
                return updated;
            });
        }
    }

    // Keep tabs saved to sessionStorage when modified
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }
        if (workspaceUuid) {
            setStoredTabs(workspaceUuid, tabs);
        }
    }, [workspaceUuid, tabs]);

    const searchParams = new URLSearchParams(location.search);
    const activeDraftId = searchParams.get('draftId') || (location.pathname.endsWith('/files/new') ? 'new' : '');
    const activeTabUuid = currentFile?.uuid ?? activeDraftId;

    const handleSelectTab = useCallback(
        (tab: DocumentTab) => {
            if (tab.uuid === activeTabUuid) return;
            if (tab.isNew || tab.uuid.startsWith('new')) {
                if (tab.uuid === 'new') {
                    navigate(files.create.build(workspaceUuid));
                } else {
                    navigate(`/workspaces/${workspaceUuid}/files/new?draftId=${tab.uuid}`);
                }
            } else {
                // If on edit page, stay in edit or switch to edit; otherwise switch to edit/view
                const isCurrentlyEditing = location.pathname.endsWith('/edit');
                if (isCurrentlyEditing) {
                    navigate(files.edit.build(workspaceUuid, tab.uuid));
                } else {
                    navigate(files.view.build(workspaceUuid, tab.uuid));
                }
            }
        },
        [activeTabUuid, navigate, workspaceUuid, location.pathname]
    );

    const handleCloseTab = useCallback(
        (tabUuid: string) => {
            if (tabUuid.startsWith('new')) {
                clearDraft(workspaceUuid, tabUuid);
            }
            setTabs((prev) => {
                const nextTabs = prev.filter((t) => t.uuid !== tabUuid);
                setStoredTabs(workspaceUuid, nextTabs);

                // If closing active tab, switch to another tab or workspace
                if (tabUuid === activeTabUuid) {
                    if (nextTabs.length > 0) {
                        const target = nextTabs[nextTabs.length - 1];
                        if (target.isNew || target.uuid.startsWith('new')) {
                            if (target.uuid === 'new') {
                                navigate(files.create.build(workspaceUuid));
                            } else {
                                navigate(`/workspaces/${workspaceUuid}/files/new?draftId=${target.uuid}`);
                            }
                        } else {
                            navigate(files.view.build(workspaceUuid, target.uuid));
                        }
                    } else {
                        navigate(`/workspaces/${workspaceUuid}`);
                    }
                }
                return nextTabs;
            });
        },
        [activeTabUuid, navigate, workspaceUuid]
    );

    const handleNewTab = useCallback(() => {
        const newDraftId = `new_${Date.now()}`;
        navigate(`/workspaces/${workspaceUuid}/files/new?draftId=${newDraftId}`);
    }, [navigate, workspaceUuid]);

    const setTabDirty = useCallback((tabUuid: string, isDirty: boolean) => {
        setTabs((prev) =>
            prev.map((t) => (t.uuid === tabUuid ? { ...t, isDirty } : t))
        );
    }, []);

    return {
        tabs,
        activeTabUuid,
        handleSelectTab,
        handleCloseTab,
        handleNewTab,
        setTabDirty,
    };
}
