import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { WorkspaceHeader, BrutalistBreadcrumbs } from '@components/ui';
import { getPageAncestors } from '@utils-functions/tree.utils';
import { FileEditor, DocumentTabsBar } from '@features-workspaces/files/components';
import { useFileEdit, useFileEditPageData } from '@features-workspaces/files/hooks/useFileEdit';
import { useDocumentTabs } from '@features-workspaces/files/hooks/useDocumentTabs';
import type { FileEditContentProps } from '@features-workspaces/files/types/file.types';

function FileEditContent({ wsUuid, fUuid, workspaceName }: FileEditContentProps) {
    const navigate = useNavigate();
    const {
        isLoading,
        title,
        icon,
        coverImage,
        isTemplate,
        workspaceTemplates,
        errorMessage,
        isSaving,
        blockEditor,
        autosaveEnabled,
        autosaveStatus,
        toggleAutosave,
        handleTitleChange,
        setIcon,
        setCoverImage,
        setIsTemplate,
        handleApplyTemplate,
        handleSave,
    } = useFileEdit(wsUuid, fUuid);

    return (
        <>
            <WorkspaceHeader
                title={`Edit File: ${title || 'Untitled'}`}
                subtitle={workspaceName ? `// WORKSPACE: ${workspaceName.toUpperCase()} // EDITING` : '// EDITING DOCUMENT'}
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                            {autosaveStatus === 'saving'
                                ? '// SAVING...'
                                : autosaveStatus === 'unsaved'
                                ? '// UNSAVED'
                                : '// SAVED'}
                        </Typography>
                        <Button
                            size="small"
                            color={autosaveEnabled ? 'primary' : 'inherit'}
                            onClick={() => toggleAutosave(!autosaveEnabled)}
                        >
                            {autosaveEnabled ? 'AUTOSAVE: ON' : 'AUTOSAVE: OFF'}
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate(`/workspaces/${wsUuid}/files/${fUuid}`)}
                            disabled={isLoading || isSaving}
                        >
                            Cancel
                        </Button>
                        <Button color="inherit" onClick={handleSave} disabled={isLoading || isSaving}>
                            {isSaving ? 'Saving...' : 'Save File (Ctrl+S)'}
                        </Button>
                    </Box>
                }
            />
            {isLoading ? (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        // LOADING_DOCUMENT...
                    </Typography>
                </Box>
            ) : (
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
            )}
        </>
    );
}

export function FileEditPage() {
    const { workspaceUuid, fileUuid } = useParams<{ workspaceUuid: string; fileUuid: string }>();
    const wsUuid = workspaceUuid ?? '';
    const fUuid = fileUuid ?? '';

    const { file, allFiles, workspace } = useFileEditPageData(wsUuid, fUuid);
    const { tabs, activeTabUuid, handleSelectTab, handleCloseTab, handleNewTab } =
        useDocumentTabs(
            wsUuid,
            file
                ? { uuid: fUuid, title: file.title, icon: file.icon, mode: 'edit' }
                : { uuid: fUuid, title: '', icon: null, mode: 'edit' }
        );

    const breadcrumbItems = useMemo(() => {
        if (!fUuid || allFiles.length === 0) return [];
        const ancestors = getPageAncestors(fUuid, allFiles);
        return [
            ...ancestors.map((anc) => ({
                label: anc.title || 'UNTITLED',
                href: `/workspaces/${wsUuid}/files/${anc.uuid}`,
            })),
            {
                label: '// EDITING',
            },
        ];
    }, [fUuid, allFiles, wsUuid]);

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

            <FileEditContent
                key={fUuid}
                wsUuid={wsUuid}
                fUuid={fUuid}
                workspaceName={workspace?.name}
            />
        </Box>
    );
}
