import { useMemo, useState, useCallback } from 'react';
import {
    useProjectTasksService,
    useCreateTaskTimeLogService,
    useDeleteTaskTimeLogService,
} from '@features-workspaces/projects/services/project.service';
import type { Task, CreateTaskTimeLogPayload } from '@features-workspaces/projects/types/project.types';

export function useTimeline(projectUuid: string) {
    const { data: tasks = [], isLoading } = useProjectTasksService(projectUuid);
    const createTimeLogMutation = useCreateTaskTimeLogService();
    const deleteTimeLogMutation = useDeleteTaskTimeLogService();

    const [selectedTaskForLog, setSelectedTaskForLog] = useState<Task | null>(null);

    // Filter tasks that have at least one date or show all with fallback
    const datedTasks = useMemo(() => {
        return tasks.filter((t) => t.startDate || t.dueDate);
    }, [tasks]);

    const handleLogTime = useCallback(
        async (taskUuid: string, payload: CreateTaskTimeLogPayload) => {
            await createTimeLogMutation.mutateAsync({
                taskUuid,
                projectUuid,
                payload,
            });
            setSelectedTaskForLog(null);
        },
        [projectUuid, createTimeLogMutation],
    );

    const handleDeleteTimeLog = useCallback(
        async (taskUuid: string, logUuid: string) => {
            await deleteTimeLogMutation.mutateAsync({
                taskUuid,
                projectUuid,
                logUuid,
            });
        },
        [projectUuid, deleteTimeLogMutation],
    );

    return {
        tasks,
        datedTasks,
        isLoading,
        selectedTaskForLog,
        setSelectedTaskForLog,
        handleLogTime,
        handleDeleteTimeLog,
        isLogging: createTimeLogMutation.isPending,
    };
}
