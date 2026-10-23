import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { files } from '@features-workspaces/files/routes/routes';
import { getStoredTabs, setStoredTabs } from '@features-workspaces/files/utils/draft-storage.utils';
import type { DocumentTab } from '@features-workspaces/files/types/file.types';

export function useDocumentTabs(workspaceUuid: string, currentFile?: { uuid: string; title: string; icon: string | null; isNew?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [tabs, setTabs] = useState<DocumentTab[]>(() => {
        if (!workspaceUuid) return [];
        return getStoredTabs(workspaceUuid);
    });

    const isFirstMount = useRef(true);

    // Sync tabs with current file being viewed/edited
    useEffect(() => {
        if (!workspaceUuid) return;

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
    }, [workspaceUuid, currentFile]);

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

    const activeTabUuid = currentFile?.uuid ?? (location.pathname.endsWith('/files/new') ? 'new' : '');

    const handleSelectTab = useCallback(
        (tab: DocumentTab) => {
            if (tab.uuid === activeTabUuid) return;
            if (tab.isNew || tab.uuid === 'new') {
                navigate(files.create.build(workspaceUuid));
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
            setTabs((prev) => {
                const nextTabs = prev.filter((t) => t.uuid !== tabUuid);
                setStoredTabs(workspaceUuid, nextTabs);

                // If closing active tab, switch to another tab or workspace
                if (tabUuid === activeTabUuid) {
                    if (nextTabs.length > 0) {
                        const target = nextTabs[nextTabs.length - 1];
                        if (target.isNew || target.uuid === 'new') {
                            navigate(files.create.build(workspaceUuid));
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
        navigate(files.create.build(workspaceUuid));
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
