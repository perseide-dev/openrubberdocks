import { useState } from 'react';
import { useProjectDetailService } from '@features-workspaces/projects/services/project.service';
import type { ProjectTab } from '@features-workspaces/projects/types/project.types';

export function useProjectDetail(projectUuid: string) {
    const { data: project, isLoading, isError } = useProjectDetailService(projectUuid);
    const [activeTab, setActiveTab] = useState<ProjectTab>('board');

    return {
        project,
        isLoading,
        isError,
        activeTab,
        setActiveTab,
    };
}
