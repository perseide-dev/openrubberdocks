import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { BrutalistBreadcrumbs } from '@components/ui';
import { useWorkspaceFilesService } from '@features/workspaces/files/services/file.service';
import { getPageAncestors } from '@utils-functions/tree.utils';
import { FileEditor } from '@features/workspaces/files/components/FileEditor';
import { useFileEdit } from '@features/workspaces/files/hooks/useFileEdit';

export function FileEditPage() {
    const { workspaceUuid, fileUuid } = useParams<{ workspaceUuid: string; fileUuid: string }>();
    const navigate = useNavigate();
    const wsUuid = workspaceUuid ?? '';
    const fUuid = fileUuid ?? '';
    const { title, errorMessage, isSaving, blockEditor, handleTitleChange, handleSave } = useFileEdit(wsUuid, fUuid);
    const { data: allFiles = [] } = useWorkspaceFilesService(wsUuid);

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
            {breadcrumbItems.length > 0 && (
                <BrutalistBreadcrumbs items={breadcrumbItems} />
            )}

            <WorkspaceHeader
                title="Edit File"
                subtitle={`// ${wsUuid}`}
                action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            color="inherit"
                            onClick={() => navigate(`/workspaces/${wsUuid}/files/${fUuid}`)}
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
                onTitleChange={handleTitleChange}
            />
        </Box>
    );
}
