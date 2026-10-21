import { useState } from 'react';
import {
    useProjectDetailService,
    useProjectTasksService,
} from '@features-workspaces/projects/services/project.service';
import type { ProjectTab } from '@features-workspaces/projects/types/project.types';

export function useProjectDetail(projectUuid: string) {
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
    const [activeTab, setActiveTab] = useState<ProjectTab>('board');

    return {
        project,
        tasks,
        isLoading: isProjectLoading || isTasksLoading,
        isError: isProjectError || isTasksError,
        activeTab,
        setActiveTab,
    };
}
