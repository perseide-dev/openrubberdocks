import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { BrutalistBreadcrumbs } from '@components/ui';
import { getPageAncestors } from '@utils-functions/tree.utils';
import { files as fileRoutes } from '@features-workspaces/files/routes/routes';
import { FileEditor } from '@features-workspaces/files/components/FileEditor';
import { useFileCreation } from '@features-workspaces/files/hooks/useFileCreation';

export function FileEditorPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const workspaceUuid = uuid ?? '';

    const {
        title,
        icon,
        coverImage,
        isTemplate,
        errorMessage,
        isSaving,
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
    } = useFileCreation(workspaceUuid);

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
            {breadcrumbItems.length > 0 && (
                <BrutalistBreadcrumbs items={breadcrumbItems} />
            )}

            <WorkspaceHeader
                title={parentFile ? `Create Sub-File of "${parentFile.title}"` : 'Create File'}
                subtitle={parentFile ? `// PARENT: ${parentFile.title} [${parentFile.uuid}]` : `// ${workspaceUuid}`}
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
                            {isSaving ? 'Saving...' : 'Save File'}
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
        </Box>
    );
}
