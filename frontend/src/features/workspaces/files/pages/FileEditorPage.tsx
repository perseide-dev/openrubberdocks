import { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { WorkspaceHeader, BrutalistBreadcrumbs } from '@components/ui';
import { getPageAncestors } from '@utils-functions/tree.utils';
import { files as fileRoutes } from '@features-workspaces/files/routes/routes';
import { FileEditor, DocumentTabsBar } from '@features-workspaces/files/components';
import { useFileCreation, useFileCreationPageData } from '@features-workspaces/files/hooks/useFileCreation';
import { useDocumentTabs } from '@features-workspaces/files/hooks/useDocumentTabs';
import type { FileCreationContentProps } from '@features-workspaces/files/types/file.types';

function FileCreationContent({
    workspaceUuid,
    draftId,
    workspaceName,
    onDraftInfoChange,
}: FileCreationContentProps) {
    const navigate = useNavigate();
    const {
        title,
        icon,
        coverImage,
        isTemplate,
        errorMessage,
        isSaving,
        blockEditor,
        parentFile,
        workspaceTemplates,
        handleTitleChange,
        setIcon,
        setCoverImage,
        setIsTemplate,
        handleApplyTemplate,
        handleSave,
    } = useFileCreation(workspaceUuid, draftId);

    useEffect(() => {
        onDraftInfoChange?.({ title: title || 'UNTITLED', icon });
    }, [title, icon, onDraftInfoChange]);

    return (
        <>
            <WorkspaceHeader
                title={parentFile ? `Create Sub-File of "${parentFile.title}"` : 'Create File'}
                subtitle={
                    parentFile
                        ? `// PARENT: ${parentFile.title}`
                        : workspaceName
                        ? `// WORKSPACE: ${workspaceName.toUpperCase()} // NEW DOCUMENT`
                        : '// NEW DOCUMENT'
                }
                action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            onClick={() => navigate(`/workspaces/${workspaceUuid}`)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button color="inherit" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save File (Ctrl+S)'}
                        </Button>
                    </Box>
                }
            />

            <FileEditor
                title={title}
                errorMessage={errorMessage}
                blockEditor={blockEditor}
                icon={icon}
                coverImage={coverImage}
                isTemplate={isTemplate}
                workspaceTemplates={workspaceTemplates}
                onTitleChange={handleTitleChange}
                onIconChange={setIcon}
                onCoverChange={setCoverImage}
                onToggleTemplate={setIsTemplate}
                onApplyTemplate={handleApplyTemplate}
            />
        </>
    );
}

export function FileEditorPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const workspaceUuid = uuid ?? '';
    const { workspace, workspaceFiles } = useFileCreationPageData(workspaceUuid);
    const parentPageUuid = searchParams.get('parent') || undefined;

    useEffect(() => {
        if (!searchParams.get('draftId')) {
            const uniqueDraftId = `new_${Date.now()}`;
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('draftId', uniqueDraftId);
                return next;
            }, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const draftId = searchParams.get('draftId') || 'new';

    const [activeTabInfo, setActiveTabInfo] = useState<{ title: string; icon: string | null }>({
        title: 'UNTITLED',
        icon: null,
    });

    const handleDraftInfoChange = useCallback((info: { title: string; icon: string | null }) => {
        setActiveTabInfo(info);
    }, []);

    const { tabs, activeTabUuid, handleSelectTab, handleCloseTab, handleNewTab } =
        useDocumentTabs(workspaceUuid, { uuid: draftId, title: activeTabInfo.title, icon: activeTabInfo.icon, isNew: true });

    const breadcrumbItems = useMemo(() => {
        if (!parentPageUuid) return [];
        const ancestors = getPageAncestors(parentPageUuid, workspaceFiles);
        return [
            ...ancestors.map((anc) => ({
                label: anc.title || 'UNTITLED',
                href: fileRoutes.view.build(workspaceUuid, anc.uuid),
            })),
            {
                label: '// NEW_SUB_FILE',
            },
        ];
    }, [parentPageUuid, workspaceFiles, workspaceUuid]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DocumentTabsBar
                tabs={tabs}
                activeTabUuid={activeTabUuid}
                onSelectTab={handleSelectTab}
                onCloseTab={handleCloseTab}
                onNewTab={handleNewTab}
            />

            {breadcrumbItems.length > 0 && (
                <BrutalistBreadcrumbs items={breadcrumbItems} />
            )}

            <FileCreationContent
                key={draftId}
                workspaceUuid={workspaceUuid}
                draftId={draftId}
                workspaceName={workspace?.name}
                onDraftInfoChange={handleDraftInfoChange}
            />
        </Box>
    );
}
