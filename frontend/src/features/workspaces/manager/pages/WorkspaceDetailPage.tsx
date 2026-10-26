import { useState, useEffect } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { FilesView } from '@features-workspaces/files/components/FilesView';
import { MembersTabContent } from '@features-workspaces/members/components/MembersTabContent';
import { ProjectsTabContent } from '@features-workspaces/projects/components/ProjectsTabContent';
import { WorkspaceAuditTabContent } from '@features/workspaces/audit/components/WorkspaceAuditTabContent';
import { useWorkspaceFiles } from '@features-workspaces/files/hooks/useWorkspaceFiles';
import { useWorkspaceDetailService, useDeleteWorkspaceService } from '@features-workspaces/manager/services/workspace.service';
import { useDeleteFileService } from '@features-workspaces/files/services/file.service';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { files } from '@features-workspaces/files/routes/routes';
import { usePermissions } from '@global-hooks/usePermissions';
import { BASE_PERMISSIONS_ACTIONS } from '@utils-constants/permissions.constants';
import type { WorkspaceFile } from '@features-workspaces/files/types/file.types';

export function WorkspaceDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const wsUuid = uuid ?? '';

    const { canMutateInWorkspace, isExternal, canViewDocuments, canViewProjects, hasPermission } = usePermissions();
    const canMutate = canMutateInWorkspace(wsUuid);

    const showFiles = !isExternal || canViewDocuments;
    const showMembers = !isExternal;
    const showProjects = !isExternal || canViewProjects;
    const showAudit = hasPermission(BASE_PERMISSIONS_ACTIONS.WORKSPACE_AUDIT, wsUuid) || hasPermission(BASE_PERMISSIONS_ACTIONS.GLOBAL_AUDIT);

    const [activeTab, setActiveTab] = useState<'files' | 'members' | 'projects' | 'audit'>(() => {
        if (!isExternal || canViewDocuments) return 'files';
        if (canViewProjects) return 'projects';
        return 'files';
    });

    useEffect(() => {
        if (activeTab === 'files' && !showFiles) {
            if (showProjects) setActiveTab('projects');
            else if (showAudit) setActiveTab('audit');
        } else if (activeTab === 'members' && !showMembers) {
            if (showFiles) setActiveTab('files');
            else if (showProjects) setActiveTab('projects');
            else if (showAudit) setActiveTab('audit');
        } else if (activeTab === 'projects' && !showProjects) {
            if (showFiles) setActiveTab('files');
            else if (showAudit) setActiveTab('audit');
        } else if (activeTab === 'audit' && !showAudit) {
            if (showFiles) setActiveTab('files');
            else if (showProjects) setActiveTab('projects');
        }
    }, [activeTab, showFiles, showMembers, showProjects, showAudit]);

    const { data: workspace } = useWorkspaceDetailService(wsUuid);
    const { files: workspaceFiles, viewMode, setViewMode } = useWorkspaceFiles(wsUuid);

    const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<WorkspaceFile | null>(null);

    const deleteWorkspaceMutation = useDeleteWorkspaceService();
    const deleteFileMutation = useDeleteFileService();

    const handleCreateFile = () => {
        if (wsUuid && canMutate) {
            navigate(files.create.build(wsUuid));
        }
    };

    const handleConfirmDeleteWorkspace = async () => {
        if (wsUuid) {
            await deleteWorkspaceMutation.mutateAsync(wsUuid);
            setIsDeleteWorkspaceOpen(false);
            navigate('/workspaces');
        }
    };

    const handleConfirmDeleteFile = async () => {
        if (fileToDelete) {
            await deleteFileMutation.mutateAsync(fileToDelete.uuid);
            setFileToDelete(null);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WorkspaceHeader
                title={workspace?.name || 'Workspace'}
                subtitle={workspace?.description ? `// ${workspace.description}` : '// WORKSPACE OVERVIEW'}
                action={
                    canMutate ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button color="inherit" onClick={handleCreateFile}>
                                Create File
                            </Button>
                            <Button
                                color="error"
                                variant="outlined"
                                onClick={() => setIsDeleteWorkspaceOpen(true)}
                            >
                                Delete Space
                            </Button>
                        </Box>
                    ) : (
                        <Tooltip title="// ACCESS: READ ONLY - MUTATION LOCKED">
                            <span>
                                <Button color="inherit" disabled>
                                    // READ ONLY
                                </Button>
                            </span>
                        </Tooltip>
                    )
                }
            />

            {/* Brutalist Section Tabs */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    paddingBottom: 1,
                }}
            >
                {showFiles && (
                    <Button
                        variant={activeTab === 'files' ? 'contained' : 'outlined'}
                        color="inherit"
                        onClick={() => setActiveTab('files')}
                        sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            borderRadius: 0,
                        }}
                    >
                        // FILES
                    </Button>
                )}
                {showMembers && (
                    <Button
                        variant={activeTab === 'members' ? 'contained' : 'outlined'}
                        color="inherit"
                        onClick={() => setActiveTab('members')}
                        sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            borderRadius: 0,
                        }}
                    >
                        // MEMBERS
                    </Button>
                )}
                {showProjects && (
                    <Button
                        variant={activeTab === 'projects' ? 'contained' : 'outlined'}
                        color="inherit"
                        onClick={() => setActiveTab('projects')}
                        sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            borderRadius: 0,
                        }}
                    >
                        // PROJECTS
                    </Button>
                )}
                {showAudit && (
                    <Button
                        variant={activeTab === 'audit' ? 'contained' : 'outlined'}
                        color="inherit"
                        onClick={() => setActiveTab('audit')}
                        sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            borderRadius: 0,
                        }}
                    >
                        // AUDIT
                    </Button>
                )}
            </Box>

            {showFiles && activeTab === 'files' && (
                <FilesView
                    files={workspaceFiles}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onDeleteFile={canMutate ? setFileToDelete : undefined}
                />
            )}

            {showMembers && activeTab === 'members' && (
                <MembersTabContent
                    workspaceUuid={wsUuid}
                    canManage={canMutate}
                />
            )}

            {showProjects && activeTab === 'projects' && (
                <ProjectsTabContent
                    workspaceUuid={wsUuid}
                    canManage={canMutate}
                />
            )}

            {showAudit && activeTab === 'audit' && (
                <WorkspaceAuditTabContent workspaceUuid={wsUuid} />
            )}

            {/* Modal: Delete Workspace */}
            <ConfirmModal
                open={isDeleteWorkspaceOpen}
                title={`DELETE WORKSPACE: ${workspace?.name || ''}`}
                description={`Are you sure you want to delete workspace "${workspace?.name}"? All nested files, blocks, and permissions will be permanently destroyed. This action is irreversible.`}
                isLoading={deleteWorkspaceMutation.isPending}
                onConfirm={handleConfirmDeleteWorkspace}
                onClose={() => setIsDeleteWorkspaceOpen(false)}
            />

            {/* Modal: Delete Document/File */}
            <ConfirmModal
                open={Boolean(fileToDelete)}
                title={`DELETE DOCUMENT: ${fileToDelete?.title || 'Untitled'}`}
                description={`Are you sure you want to delete "${fileToDelete?.title || 'Untitled'}"? All contained content blocks and revision snapshots will be permanently deleted.`}
                isLoading={deleteFileMutation.isPending}
                onConfirm={handleConfirmDeleteFile}
                onClose={() => setFileToDelete(null)}
            />
        </Box>
    );
}
