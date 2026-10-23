import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { BrutalistBreadcrumbs } from '@components/ui';
import { useWorkspaceFilesService, useFileDetailService } from '@features-workspaces/files/services/file.service';
import { useWorkspaceDetailService } from '@features-workspaces/manager/services/workspace.service';
import { getPageAncestors } from '@utils-functions/tree.utils';
import { FileEditor, DocumentTabsBar } from '@features-workspaces/files/components';
import { useFileEdit } from '@features-workspaces/files/hooks/useFileEdit';
import { useDocumentTabs } from '@features-workspaces/files/hooks/useDocumentTabs';

export function FileEditPage() {
    const { workspaceUuid, fileUuid } = useParams<{ workspaceUuid: string; fileUuid: string }>();
    const navigate = useNavigate();
    const wsUuid = workspaceUuid ?? '';
    const fUuid = fileUuid ?? '';
    const {
        title,
        icon,
        coverImage,
        isTemplate,
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
        handleSave,
    } = useFileEdit(wsUuid, fUuid);

    const { data: file } = useFileDetailService(fUuid);
    const { tabs, activeTabUuid, handleSelectTab, handleCloseTab, handleNewTab } =
        useDocumentTabs(
            wsUuid,
            file
                ? { uuid: fUuid, title: file.title, icon: file.icon, mode: 'edit' }
                : { uuid: fUuid, title: '', icon: null, mode: 'edit' }
        );

    const { data: allFiles = [] } = useWorkspaceFilesService(wsUuid);
    const { data: workspace } = useWorkspaceDetailService(wsUuid);

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

            <WorkspaceHeader
                title={`Edit File: ${title || 'Untitled'}`}
                subtitle={workspace?.name ? `// WORKSPACE: ${workspace.name.toUpperCase()} // EDITING` : '// EDITING DOCUMENT'}
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
                onTitleChange={handleTitleChange}
                onIconChange={setIcon}
                onCoverChange={setCoverImage}
                onToggleTemplate={setIsTemplate}
            />
        </Box>
    );
}
