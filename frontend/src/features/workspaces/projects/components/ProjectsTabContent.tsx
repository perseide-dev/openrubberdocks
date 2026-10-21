import React from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardActionArea,
    TextField,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceProjects } from '@features-workspaces/projects/hooks/useWorkspaceProjects';
import { CreateProjectModal } from '@features-workspaces/projects/components/CreateProjectModal';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { PROJECT_LABELS } from '@features-workspaces/projects/constants/project.constants';
import { projectsRoutes } from '@features-workspaces/projects/routes/routes';
import type { ProjectsTabContentProps } from '@features-workspaces/projects/types/project.types';

export const ProjectsTabContent: React.FC<ProjectsTabContentProps> = ({
    workspaceUuid,
    canManage,
}) => {
    const navigate = useNavigate();
    const {
        projects,
        isLoading,
        searchQuery,
        setSearchQuery,
        isCreateModalOpen,
        setIsCreateModalOpen,
        projectToDelete,
        setProjectToDelete,
        handleDeleteProject,
        isDeleting,
    } = useWorkspaceProjects(workspaceUuid);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Action Bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                <TextField
                    size="small"
                    placeholder="// SEARCH_PROJECTS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                />

                {canManage ? (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        {PROJECT_LABELS.CREATE_PROJECT}
                    </Button>
                ) : (
                    <Tooltip title={PROJECT_LABELS.RESTORE_LOCKED}>
                        <span>
                            <Button variant="outlined" disabled startIcon={<AddIcon />}>
                                {PROJECT_LABELS.CREATE_PROJECT}
                            </Button>
                        </span>
                    </Tooltip>
                )}
            </Box>

            {/* Content Area */}
            {isLoading ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 6,
                        gap: 2,
                    }}
                >
                    <CircularProgress size={32} />
                    <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                        {PROJECT_LABELS.LOADING}
                    </Typography>
                </Box>
            ) : projects.length === 0 ? (
                <Box sx={{ padding: 6, textAlign: 'center' }}>
                    <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                        {PROJECT_LABELS.NO_PROJECTS}
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                        },
                        gap: 2.5,
                    }}
                >
                    {projects.map((project) => (
                        <Card key={project.uuid} variant="outlined">
                            <CardActionArea
                                onClick={() =>
                                    navigate(
                                        projectsRoutes.detail.build(
                                            workspaceUuid,
                                            project.uuid,
                                        ),
                                    )
                                }
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.5,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 700 }}
                                            noWrap
                                        >
                                            {project.name}
                                        </Typography>
                                        {canManage && (
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setProjectToDelete(project);
                                                }}
                                            >
                                                <DeleteOutlinedIcon fontSize="small" />
                                            </Button>
                                        )}
                                    </Box>

                                    {project.description && (
                                        <Typography
                                            variant="body2"
                                            sx={{ color: 'text.secondary' }}
                                            noWrap
                                        >
                                            {project.description}
                                        </Typography>
                                    )}

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginTop: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontFamily: 'monospace',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {project.startDate
                                                ? `// START: ${new Date(project.startDate).toLocaleDateString()}`
                                                : '// NO_START_DATE'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontFamily: 'monospace',
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {project.targetDate
                                                ? `// DUE: ${new Date(project.targetDate).toLocaleDateString()}`
                                                : '// NO_DUE_DATE'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>
            )}

            <CreateProjectModal
                open={isCreateModalOpen}
                workspaceUuid={workspaceUuid}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <ConfirmModal
                open={Boolean(projectToDelete)}
                title={`DELETE PROJECT: ${projectToDelete?.name || ''}`}
                description={`Are you sure you want to delete project "${projectToDelete?.name}"? All associated tasks, statuses, custom properties, and time logs will be permanently removed.`}
                isLoading={isDeleting}
                onConfirm={handleDeleteProject}
                onClose={() => setProjectToDelete(null)}
            />
        </Box>
    );
};
