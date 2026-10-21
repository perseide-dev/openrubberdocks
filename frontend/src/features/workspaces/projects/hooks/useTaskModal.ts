import { useState, useCallback } from 'react';
import {
    useTaskDetailService,
    useCreateTaskService,
    useUpdateTaskService,
    useDeleteTaskService,
} from '@features-workspaces/projects/services/project.service';
import type {
    CreateTaskPayload,
    UpdateTaskPayload,
} from '@features-workspaces/projects/types/project.types';

export function useTaskModal(projectUuid: string, taskUuid: string | null) {
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

    if (task && task.uuid !== prevTaskUuid) {
        setPrevTaskUuid(task.uuid);
        setTitle(task.title);
        setDescription(task.description || '');
        setStatusUuid(task.statusUuid);
        setTypeUuid(task.typeUuid);
        setParentTaskUuid(task.parentTaskUuid);
        setStartDate(task.startDate ? task.startDate.split('T')[0] : '');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setEstimatedMinutes(task.estimatedMinutes ?? '');
        setCustomProperties(task.customProperties || {});
    } else if (!task && prevTaskUuid !== null) {
        setPrevTaskUuid(null);
        setTitle('');
        setDescription('');
        setStatusUuid('');
        setTypeUuid('');
        setParentTaskUuid(null);
        setStartDate('');
        setDueDate('');
        setEstimatedMinutes('');
        setCustomProperties({});
    }

    const handleSaveTask = useCallback(async () => {
        if (!title.trim()) return;

        if (taskUuid) {
            const payload: UpdateTaskPayload = {
                title: title.trim(),
                description: description.trim() || undefined,
                statusUuid: statusUuid || undefined,
                typeUuid: typeUuid || undefined,
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
                statusUuid: statusUuid || undefined,
                typeUuid: typeUuid || undefined,
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
                statusUuid,
                typeUuid,
            },
        });
        setSubtaskTitle('');
    }, [subtaskTitle, taskUuid, projectUuid, statusUuid, typeUuid, createTaskMutation]);

    const handleDeleteTask = useCallback(async () => {
        if (!taskUuid) return;
        await deleteTaskMutation.mutateAsync({ taskUuid, projectUuid });
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
        handleSaveTask,
        handleDeleteTask,
        isSaving: createTaskMutation.isPending || updateTaskMutation.isPending,
        isDeleting: deleteTaskMutation.isPending,
    };
}
