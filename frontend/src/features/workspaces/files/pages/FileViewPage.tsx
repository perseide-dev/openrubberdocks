import { useState, useMemo } from 'react';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { FileViewer, DocumentTabsBar } from '@features-workspaces/files/components';
import { useFileView } from '@features-workspaces/files/hooks/useFileView';
import { useDeleteFileService, useWorkspaceFilesService } from '@features-workspaces/files/services/file.service';
import { useWorkspaceDetailService } from '@features-workspaces/manager/services/workspace.service';
import { ConfirmModal, BrutalistBreadcrumbs } from '@components/ui';
import { getPageAncestors } from '@utils-functions/tree.utils';
import { files } from '@features-workspaces/files/routes/routes';
import { usePermissions } from '@global-hooks/usePermissions';
import { RevisionHistoryDrawer } from '@features-workspaces/files/components/RevisionHistoryDrawer';
import { REVISION_LABELS } from '@features-workspaces/files/constants/revision.constants';
import { useDocumentTabs } from '@features-workspaces/files/hooks/useDocumentTabs';

export function FileViewPage() {
    const { workspaceUuid, fileUuid } = useParams<{ workspaceUuid: string; fileUuid: string }>();
    const navigate = useNavigate();
    const wsUuid = workspaceUuid ?? '';
    const fUuid = fileUuid ?? '';
    const { file, blocks, isLoading } = useFileView(wsUuid, fUuid);

    const { tabs, activeTabUuid, handleSelectTab, handleCloseTab, handleNewTab } =
        useDocumentTabs(wsUuid, file ? { uuid: fUuid, title: file.title, icon: file.icon } : undefined);

    const { data: allFiles = [] } = useWorkspaceFilesService(wsUuid);
    const { data: workspace } = useWorkspaceDetailService(wsUuid);
    const { canMutateInWorkspace, hasPermission } = usePermissions();
    const canMutate = canMutateInWorkspace(wsUuid);
    const canReadHistory = hasPermission('document:read', wsUuid);
    const canRestore = canMutate && hasPermission('document:write', wsUuid);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const deleteFileMutation = useDeleteFileService();

    const breadcrumbItems = useMemo(() => {
        if (!fUuid || allFiles.length === 0) return [];
        const ancestors = getPageAncestors(fUuid, allFiles);
        return ancestors.map((anc, idx) => {
            const isCurrent = idx === ancestors.length - 1;
            return {
                label: anc.title || 'UNTITLED',
                href: isCurrent ? undefined : files.view.build(wsUuid, anc.uuid),
            };
        });
    }, [fUuid, allFiles, wsUuid]);

    const handleConfirmDelete = async () => {
        if (fUuid) {
            await deleteFileMutation.mutateAsync(fUuid);
            setIsDeleteOpen(false);
            navigate(`/workspaces/${wsUuid}`);
        }
    };

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
                title={file?.title || 'Untitled'}
                subtitle={workspace?.name ? `// WORKSPACE: ${workspace.name.toUpperCase()}` : '// DOCUMENT'}
                action={
                    canMutate ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {canReadHistory && (
                                <Button
                                    color="inherit"
                                    variant="outlined"
                                    onClick={() => setIsHistoryOpen(true)}
                                    disabled={isLoading || !file}
                                >
                                    {REVISION_LABELS.BUTTON_HISTORY}
                                </Button>
                            )}
                            <Button
                                color="inherit"
                                onClick={() => navigate(files.edit.build(wsUuid, fUuid))}
                                disabled={isLoading || !file}
                            >
                                Edit
                            </Button>
                            <Button
                                color="error"
                                variant="outlined"
                                onClick={() => setIsDeleteOpen(true)}
                                disabled={isLoading || !file}
                            >
                                Delete
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {canReadHistory && (
                                <Button
                                    color="inherit"
                                    variant="outlined"
                                    onClick={() => setIsHistoryOpen(true)}
                                    disabled={isLoading || !file}
                                >
                                    {REVISION_LABELS.BUTTON_HISTORY}
                                </Button>
                            )}
                            <Tooltip title="// ACCESS: READ ONLY - MUTATION LOCKED">
                                <span>
                                    <Button color="inherit" disabled>
                                        // READ ONLY
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>
                    )
                }
            />
            <Box sx={{ padding: 2 }}>
                {isLoading ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        // LOADING_DOCUMENT...
                    </Typography>
                ) : (
                    <FileViewer
                        blocks={blocks}
                        icon={file?.icon}
                        coverImage={file?.coverImage}
                        isTemplate={file?.isTemplate}
                    />
                )}
            </Box>

            <ConfirmModal
                open={isDeleteOpen}
                title={`DELETE DOCUMENT: ${file?.title || 'Untitled'}`}
                description={`Are you sure you want to delete "${file?.title || 'Untitled'}"? All contained content blocks and revision snapshots will be permanently removed. This action cannot be undone.`}
                isLoading={deleteFileMutation.isPending}
                onConfirm={handleConfirmDelete}
                onClose={() => setIsDeleteOpen(false)}
            />

            <RevisionHistoryDrawer
                open={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                fileUuid={fUuid}
                workspaceUuid={wsUuid}
                canRestore={canRestore}
            />
        </Box>
    );
}
