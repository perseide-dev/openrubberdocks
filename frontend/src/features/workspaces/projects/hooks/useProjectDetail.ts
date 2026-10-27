import { useState, useCallback } from 'react';
import {
    useProjectDetailService,
    useProjectTasksService,
    useProjectPropertiesService,
    useProjectStatusesService,
    useProjectTypesService,
    useDeleteTaskService,
} from '@features-workspaces/projects/services/project.service';
import { useWorkspaceDetailService } from '@features-workspaces/manager/services/workspace.service';
import type { ProjectTab } from '@features-workspaces/projects/types/project.types';

export function useProjectDetail(projectUuid: string, workspaceUuid = '') {
    const {
        data: project,
        isLoading: isProjectLoading,
        isError: isProjectError,
    } = useProjectDetailService(projectUuid);
    const {
        data: tasks = [],
        isLoading: isTasksLoading,
        isError: isTasksError,
    } = useProjectTasksService(projectUuid);
    const { data: workspace } = useWorkspaceDetailService(workspaceUuid);
    const { data: projectProperties } = useProjectPropertiesService(projectUuid);
    const { data: projectStatuses } = useProjectStatusesService(projectUuid);
    const { data: projectTypes } = useProjectTypesService(projectUuid);
    const deleteTaskMutation = useDeleteTaskService();

    const [activeTab, setActiveTab] = useState<ProjectTab>('board');

    const deleteTask = useCallback(
        async (taskUuid: string) => {
            await deleteTaskMutation.mutateAsync({
                taskUuid,
                projectUuid,
            });
        },
        [projectUuid, deleteTaskMutation],
    );

    const statuses = projectStatuses ?? project?.statuses ?? [];
    const types = projectTypes ?? project?.types ?? [];
    const properties = projectProperties ?? project?.propertyDefinitions ?? [];

    return {
        project,
        tasks,
        workspace,
        statuses,
        types,
        properties,
        isLoading: isProjectLoading || isTasksLoading,
        isError: isProjectError || isTasksError,
        activeTab,
        setActiveTab,
        deleteTask,
        isDeletingTask: deleteTaskMutation.isPending,
    };
}
