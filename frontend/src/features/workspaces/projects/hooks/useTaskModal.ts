import { useState, useCallback, useEffect, useRef } from 'react';
import {
    useTaskDetailService,
    useCreateTaskService,
    useUpdateTaskService,
    useDeleteTaskService,
} from '@features-workspaces/projects/services/project.service';
import type {
    CreateTaskPayload,
    UpdateTaskPayload,
    TaskStatus,
    TaskType,
} from '@features-workspaces/projects/types/project.types';

export function useTaskModal(
    projectUuid: string,
    taskUuid: string | null,
    open = true,
    statuses: TaskStatus[] = [],
    types: TaskType[] = [],
) {
    const { data: task, isLoading } = useTaskDetailService(taskUuid);
    const createTaskMutation = useCreateTaskService();
    const updateTaskMutation = useUpdateTaskService();
    const deleteTaskMutation = useDeleteTaskService();

    const [prevTaskUuid, setPrevTaskUuid] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [statusUuid, setStatusUuid] = useState('');
    const [typeUuid, setTypeUuid] = useState('');
    const [parentTaskUuid, setParentTaskUuid] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [estimatedMinutes, setEstimatedMinutes] = useState<number | ''>('');
    const [customProperties, setCustomProperties] = useState<Record<string, unknown>>({});
    const [subtaskTitle, setSubtaskTitle] = useState('');

    const prevOpenRef = useRef(open);

    useEffect(() => {
        const openedForCreate = open && !prevOpenRef.current && taskUuid === null;
        prevOpenRef.current = open;

        if (openedForCreate) {
            setPrevTaskUuid(null);
            setTitle('');
            setDescription('');
            setStatusUuid(statuses[0]?.uuid ?? '');
            setTypeUuid(types[0]?.uuid ?? '');
            setParentTaskUuid(null);
            setStartDate('');
            setDueDate('');
            setEstimatedMinutes('');
            setCustomProperties({});
            setSubtaskTitle('');
        }
    }, [open, taskUuid, statuses, types]);

    if (task && task.uuid !== prevTaskUuid) {
        setPrevTaskUuid(task.uuid);
        setTitle(task.title);
        setDescription(task.description || '');
        setStatusUuid(task.statusUuid || (statuses[0]?.uuid ?? ''));
        setTypeUuid(task.typeUuid || (types[0]?.uuid ?? ''));
        setParentTaskUuid(task.parentTaskUuid);
        setStartDate(task.startDate ? task.startDate.split('T')[0] : '');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setEstimatedMinutes(task.estimatedMinutes ?? '');
        setCustomProperties(task.customProperties || {});
    } else if (!task && prevTaskUuid !== null) {
        setPrevTaskUuid(null);
        setTitle('');
        setDescription('');
        setStatusUuid(statuses[0]?.uuid ?? '');
        setTypeUuid(types[0]?.uuid ?? '');
        setParentTaskUuid(null);
        setStartDate('');
        setDueDate('');
        setEstimatedMinutes('');
        setCustomProperties({});
        setSubtaskTitle('');
    }

    const handleSaveTask = useCallback(async () => {
        if (!title.trim()) return;

        const resolvedStatusUuid = statusUuid || statuses[0]?.uuid || undefined;
        const resolvedTypeUuid = typeUuid || types[0]?.uuid || undefined;

        if (taskUuid) {
            const payload: UpdateTaskPayload = {
                title: title.trim(),
                description: description.trim() || undefined,
                statusUuid: resolvedStatusUuid,
                typeUuid: resolvedTypeUuid,
                parentTaskUuid,
                startDate: startDate || null,
                dueDate: dueDate || null,
                estimatedMinutes: typeof estimatedMinutes === 'number' ? estimatedMinutes : null,
                customProperties,
            };
            await updateTaskMutation.mutateAsync({
                taskUuid,
                projectUuid,
                payload,
            });
        } else {
            const payload: CreateTaskPayload = {
                title: title.trim(),
                description: description.trim() || undefined,
                statusUuid: resolvedStatusUuid,
                typeUuid: resolvedTypeUuid,
                parentTaskUuid: parentTaskUuid || undefined,
                startDate: startDate || undefined,
                dueDate: dueDate || undefined,
                estimatedMinutes: typeof estimatedMinutes === 'number' ? estimatedMinutes : undefined,
                customProperties,
            };
            await createTaskMutation.mutateAsync({
                projectUuid,
                payload,
            });
        }
    }, [
        title,
        description,
        statusUuid,
        typeUuid,
        statuses,
        types,
        parentTaskUuid,
        startDate,
        dueDate,
        estimatedMinutes,
        customProperties,
        taskUuid,
        projectUuid,
        updateTaskMutation,
        createTaskMutation,
    ]);

    const handleAddSubtask = useCallback(async () => {
        if (!subtaskTitle.trim() || !taskUuid) return;
        await createTaskMutation.mutateAsync({
            projectUuid,
            payload: {
                title: subtaskTitle.trim(),
                parentTaskUuid: taskUuid,
                statusUuid: statusUuid || statuses[0]?.uuid || undefined,
                typeUuid: typeUuid || types[0]?.uuid || undefined,
            },
        });
        setSubtaskTitle('');
    }, [subtaskTitle, taskUuid, projectUuid, statusUuid, typeUuid, statuses, types, createTaskMutation]);

    const handleDeleteTask = useCallback(async () => {
        if (!taskUuid) return;
        await deleteTaskMutation.mutateAsync({ taskUuid, projectUuid });
    }, [taskUuid, projectUuid, deleteTaskMutation]);

    const handleDeleteSubtask = useCallback(async (stUuid: string) => {
        if (!taskUuid) return;
        await deleteTaskMutation.mutateAsync({
            taskUuid: stUuid,
            projectUuid,
            parentTaskUuid: taskUuid,
        });
    }, [taskUuid, projectUuid, deleteTaskMutation]);

    const handleCustomPropertyChange = useCallback((key: string, value: unknown) => {
        setCustomProperties((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    return {
        task,
        isLoading,
        title,
        setTitle,
        description,
        setDescription,
        statusUuid,
        setStatusUuid,
        typeUuid,
        setTypeUuid,
        parentTaskUuid,
        setParentTaskUuid,
        startDate,
        setStartDate,
        dueDate,
        setDueDate,
        estimatedMinutes,
        setEstimatedMinutes,
        customProperties,
        handleCustomPropertyChange,
        subtaskTitle,
        setSubtaskTitle,
        handleAddSubtask,
        handleDeleteSubtask,
        handleSaveTask,
        handleDeleteTask,
        isSaving: createTaskMutation.isPending || updateTaskMutation.isPending,
        isDeleting: deleteTaskMutation.isPending,
    };
}
