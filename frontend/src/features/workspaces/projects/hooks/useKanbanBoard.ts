import { useMemo, useCallback } from 'react';
import {
    useProjectStatusesService,
    useProjectTasksService,
    useMoveTaskService,
    useCreateTaskService,
} from '@features-workspaces/projects/services/project.service';
import type { Task } from '@features-workspaces/projects/types/project.types';

export function useKanbanBoard(projectUuid: string) {
    const { data: statuses = [], isLoading: isLoadingStatuses } = useProjectStatusesService(projectUuid);
    const { data: tasks = [], isLoading: isLoadingTasks } = useProjectTasksService(projectUuid);
    const moveTaskMutation = useMoveTaskService();
    const createTaskMutation = useCreateTaskService();

    // Group tasks by statusUuid
    const tasksByStatus = useMemo(() => {
        const map = new Map<string, Task[]>();
        statuses.forEach((s) => map.set(s.uuid, []));
        tasks.forEach((t) => {
            const list = map.get(t.statusUuid);
            if (list) {
                list.push(t);
            } else {
                map.set(t.statusUuid, [t]);
            }
        });

        // Sort each column by orderIndex
        map.forEach((list) => list.sort((a, b) => a.orderIndex - b.orderIndex));
        return map;
    }, [statuses, tasks]);

    const handleMoveTask = useCallback(
        async (taskUuid: string, targetStatusUuid: string, newOrderIndex: number) => {
            await moveTaskMutation.mutateAsync({
                taskUuid,
                projectUuid,
                payload: {
                    statusUuid: targetStatusUuid,
                    orderIndex: newOrderIndex,
                },
            });
        },
        [projectUuid, moveTaskMutation],
    );

    const handleQuickAddTask = useCallback(
        async (statusUuid: string, title: string) => {
            await createTaskMutation.mutateAsync({
                projectUuid,
                payload: {
                    title,
                    statusUuid,
                },
            });
        },
        [projectUuid, createTaskMutation],
    );

    return {
        statuses,
        tasks,
        tasksByStatus,
        isLoading: isLoadingStatuses || isLoadingTasks,
        handleMoveTask,
        handleQuickAddTask,
        isMoving: moveTaskMutation.isPending,
        isCreating: createTaskMutation.isPending,
    };
}
