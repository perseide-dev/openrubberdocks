import { useMemo, useState, useCallback } from 'react';
import {
    useProjectTasksService,
    useTaskTimeLogsService,
    useCreateTaskTimeLogService,
    useDeleteTaskTimeLogService,
} from '@features-workspaces/projects/services/project.service';
import type { Task, CreateTaskTimeLogPayload } from '@features-workspaces/projects/types/project.types';

export function useTaskTimeLogs(taskUuid: string | null, projectUuid: string) {
    const { data: logs = [] } = useTaskTimeLogsService(taskUuid);
    const createLogMutation = useCreateTaskTimeLogService();
    const deleteLogMutation = useDeleteTaskTimeLogService();

    const [minutes, setMinutes] = useState<number | ''>(60);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

    const handleLogSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!taskUuid || !minutes || typeof minutes !== 'number') return;

            await createLogMutation.mutateAsync({
                taskUuid,
                projectUuid,
                payload: {
                    minutes,
                    description: description.trim() || undefined,
                    date: date || undefined,
                },
            });

            setDescription('');
            setMinutes(60);
        },
        [taskUuid, projectUuid, minutes, description, date, createLogMutation],
    );

    const handleDeleteLog = useCallback(
        async (logUuid: string) => {
            if (!taskUuid) return;
            await deleteLogMutation.mutateAsync({
                taskUuid,
                projectUuid,
                logUuid,
            });
        },
        [taskUuid, projectUuid, deleteLogMutation],
    );

    const totalMinutes = useMemo(
        () => logs.reduce((acc, curr) => acc + curr.minutes, 0),
        [logs],
    );

    return {
        logs,
        minutes,
        setMinutes,
        description,
        setDescription,
        date,
        setDate,
        totalMinutes,
        handleLogSubmit,
        handleDeleteLog,
        isCreating: createLogMutation.isPending,
    };
}

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
