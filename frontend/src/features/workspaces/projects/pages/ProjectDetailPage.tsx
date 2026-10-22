import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    CircularProgress,
    Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useNavigate } from 'react-router-dom';
import { usePermissions } from '@global-hooks/usePermissions';
import { useProjectDetail } from '@features-workspaces/projects/hooks/useProjectDetail';
import {
    useCreateTaskService,
    useMoveTaskService,
    useDeleteTaskService,
    useProjectPropertiesService,
    useProjectStatusesService,
    useProjectTypesService,
} from '@features-workspaces/projects/services/project.service';
import { ConfirmModal } from '@components/ui/ConfirmModal';
import { WorkspaceHeader } from '@features-workspaces/components/WorkspaceHeader';
import { useWorkspaceDetailService } from '@features-workspaces/manager/services/workspace.service';
import { KanbanBoard } from '@features-workspaces/projects/components/KanbanBoard/KanbanBoard';
import { TimelineView } from '@features-workspaces/projects/components/TimelineView/TimelineView';
import { TasksTable } from '@features-workspaces/projects/components/TasksListView/TasksTable';
import { ProjectFilesTab } from '@features-workspaces/projects/components/ProjectFilesView/ProjectFilesTab';
import { ProjectSettingsTab } from '@features-workspaces/projects/components/ProjectSettings/ProjectSettingsTab';
import { TaskDetailModal } from '@features-workspaces/projects/components/TaskDetailModal';
import { TimeLogModal } from '@features-workspaces/projects/components/TimelineView/TimeLogModal';
import { PROJECT_LABELS } from '@features-workspaces/projects/constants/project.constants';
import type { Task, ProjectTab } from '@features-workspaces/projects/types/project.types';

export const ProjectDetailPage: React.FC = () => {
    const { workspaceUuid, projectUuid } = useParams<{
        workspaceUuid: string;
        projectUuid: string;
    }>();
    const navigate = useNavigate();

    const pUuid = projectUuid ?? '';
    const wsUuid = workspaceUuid ?? '';

    const { project, tasks, isLoading, isError, activeTab, setActiveTab } = useProjectDetail(pUuid);
    const { data: workspace } = useWorkspaceDetailService(wsUuid);
    const { canMutateInWorkspace } = usePermissions();
    const canManage = canMutateInWorkspace(wsUuid);

    const createTaskMutation = useCreateTaskService();
    const moveTaskMutation = useMoveTaskService();
    const deleteTaskMutation = useDeleteTaskService();

    const { data: projectProperties } = useProjectPropertiesService(pUuid);
    const { data: projectStatuses } = useProjectStatusesService(pUuid);
    const { data: projectTypes } = useProjectTypesService(pUuid);

    const [selectedTaskUuid, setSelectedTaskUuid] = useState<string | null>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [timeLogTask, setTimeLogTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<{ uuid: string; title: string } | null>(null);

    const handleDeleteTaskFromTable = async () => {
        if (!taskToDelete) return;
        await deleteTaskMutation.mutateAsync({
            taskUuid: taskToDelete.uuid,
            projectUuid: pUuid,
        });
        setTaskToDelete(null);
    };

    const handleQuickAddTask = async (statusUuid: string, title: string) => {
        await createTaskMutation.mutateAsync({
            projectUuid: pUuid,
            payload: {
                title,
                statusUuid,
            },
        });
    };

    const handleMoveTask = async (
        taskUuid: string,
        targetStatusUuid: string,
        newOrderIndex: number,
    ) => {
        await moveTaskMutation.mutateAsync({
            taskUuid,
            projectUuid: pUuid,
            payload: {
                statusUuid: targetStatusUuid,
                orderIndex: newOrderIndex,
            },
        });
    };

    const handleOpenCreateTask = () => {
        setSelectedTaskUuid(null);
        setIsTaskModalOpen(true);
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTaskUuid(task.uuid);
        setIsTaskModalOpen(true);
    };

    const handleCloseTaskModal = () => {
        setIsTaskModalOpen(false);
        setSelectedTaskUuid(null);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress size={40} />
            </Box>
        );
    }

    if (isError || !project) {
        return (
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                <Typography variant="h6" color="error">
                    // ERROR: PROJECT_NOT_FOUND
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/workspaces/${wsUuid}`)}
                >
                    BACK TO WORKSPACE
                </Button>
            </Box>
        );
    }

    const statuses = projectStatuses ?? project.statuses ?? [];
    const types = projectTypes ?? project.types ?? [];
    const properties = projectProperties ?? project.propertyDefinitions ?? [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header */}
            <WorkspaceHeader
                title={`${project.icon ? `${project.icon} ` : ''}${project.name}`}
                subtitle={workspace?.name ? `// WORKSPACE: ${workspace.name.toUpperCase()} // PROJECT` : '// PROJECT'}
                action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(`/workspaces/${wsUuid}`)}
                        >
                            WORKSPACE
                        </Button>
                        {canManage && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreateTask}
                            >
                                {PROJECT_LABELS.ADD_TASK}
                            </Button>
                        )}
                    </Box>
                }
            />

            {/* Project metadata banner */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {project.description && (
                    <Typography variant="body2" color="text.secondary">
                        {project.description}
                    </Typography>
                )}
                {project.targetDate && (
                    <Chip
                        size="small"
                        label={`// TARGET: ${new Date(project.targetDate).toLocaleDateString()}`}
                        sx={{ fontFamily: 'monospace' }}
                    />
                )}
                <Chip
                    size="small"
                    label={`// TOTAL_TASKS: ${tasks.length}`}
                    sx={{ fontFamily: 'monospace' }}
                />
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val as ProjectTab)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label={PROJECT_LABELS.TAB_BOARD} value="board" sx={{ fontFamily: 'monospace' }} />
                    <Tab label={PROJECT_LABELS.TAB_TIMELINE} value="timeline" sx={{ fontFamily: 'monospace' }} />
                    <Tab label={PROJECT_LABELS.TAB_TASKS} value="tasks" sx={{ fontFamily: 'monospace' }} />
                    <Tab label={PROJECT_LABELS.TAB_FILES} value="files" sx={{ fontFamily: 'monospace' }} />
                    <Tab label={PROJECT_LABELS.TAB_SETTINGS} value="settings" sx={{ fontFamily: 'monospace' }} />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            {activeTab === 'board' && (
                <KanbanBoard
                    projectUuid={pUuid}
                    statuses={statuses}
                    tasks={tasks}
                    canManage={canManage}
                    onTaskClick={handleTaskClick}
                    onQuickAddTask={handleQuickAddTask}
                    onMoveTask={handleMoveTask}
                />
            )}

            {activeTab === 'timeline' && (
                <TimelineView
                    projectUuid={pUuid}
                    tasks={tasks}
                    canManage={canManage}
                    onTaskClick={handleTaskClick}
                    onOpenTimeLog={(t) => setTimeLogTask(t)}
                />
            )}

            {activeTab === 'tasks' && (
                <TasksTable
                    tasks={tasks}
                    properties={properties}
                    canManage={canManage}
                    onTaskClick={handleTaskClick}
                    onDeleteTask={(taskUuid) => {
                        const found = tasks.find((t) => t.uuid === taskUuid);
                        setTaskToDelete({ uuid: taskUuid, title: found?.title || taskUuid });
                    }}
                />
            )}

            {activeTab === 'files' && (
                <ProjectFilesTab
                    projectUuid={pUuid}
                    workspaceUuid={wsUuid}
                    canManage={canManage}
                />
            )}

            {activeTab === 'settings' && (
                <ProjectSettingsTab
                    projectUuid={pUuid}
                    statuses={statuses}
                    types={types}
                    properties={properties}
                    canManage={canManage}
                />
            )}

            {/* Modals */}
            <TaskDetailModal
                open={isTaskModalOpen}
                taskUuid={selectedTaskUuid}
                projectUuid={pUuid}
                statuses={statuses}
                types={types}
                properties={properties}
                canManage={canManage}
                onClose={handleCloseTaskModal}
            />

            <TimeLogModal
                open={Boolean(timeLogTask)}
                task={timeLogTask}
                onClose={() => setTimeLogTask(null)}
            />

            {/* Confirm task deletion from TasksTable */}
            <ConfirmModal
                open={Boolean(taskToDelete)}
                title="DELETE TASK"
                description={`Are you sure you want to delete task "${taskToDelete?.title}"? All subtasks and logged hours will be removed.`}
                isLoading={deleteTaskMutation.isPending}
                onConfirm={handleDeleteTaskFromTable}
                onClose={() => setTaskToDelete(null)}
            />
        </Box>
    );
};
