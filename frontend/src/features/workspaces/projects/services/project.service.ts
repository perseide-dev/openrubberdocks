import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getWorkspaceProjectsRepository,
    getProjectByUuidRepository,
    createProjectRepository,
    updateProjectRepository,
    deleteProjectRepository,
    getProjectStatusesRepository,
    createProjectStatusRepository,
    deleteProjectStatusRepository,
    getProjectTypesRepository,
    createProjectTypeRepository,
    deleteProjectTypeRepository,
    getProjectPropertiesRepository,
    createProjectPropertyRepository,
    deleteProjectPropertyRepository,
    getProjectFilesRepository,
    linkProjectFileRepository,
    unlinkProjectFileRepository,
    getProjectTasksRepository,
    getTaskByUuidRepository,
    createTaskRepository,
    updateTaskRepository,
    moveTaskRepository,
    deleteTaskRepository,
    getTaskTimeLogsRepository,
    createTaskTimeLogRepository,
    deleteTaskTimeLogRepository,
} from '@features-workspaces/projects/repositories/project.repository';
import {
    PROJECT_QUERY_KEYS,
    PROJECT_DEFAULTS,
} from '@features-workspaces/projects/constants/project.constants';
import type {
    Project,
    Task,
    TaskStatus,
    TaskType,
    TaskPropertyDefinition,
    TaskTimeLog,
    ProjectFileLink,
    CreateProjectPayload,
    UpdateProjectPayload,
    CreateTaskPayload,
    UpdateTaskPayload,
    MoveTaskPayload,
    CreateTaskStatusPayload,
    CreateTaskTypePayload,
    CreateTaskPropertyPayload,
    CreateTaskTimeLogPayload,
    LinkProjectFilePayload,
} from '@features-workspaces/projects/types/project.types';
import type { AppError } from '@http-error/http-error.handler';

// Projects
export function useWorkspaceProjectsService(workspaceUuid: string) {
    return useQuery<Project[], AppError>({
        queryKey: PROJECT_QUERY_KEYS.WORKSPACE(workspaceUuid),
        queryFn: () => getWorkspaceProjectsRepository(workspaceUuid),
        enabled: Boolean(workspaceUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useProjectDetailService(projectUuid: string) {
    return useQuery<Project, AppError>({
        queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
        queryFn: () => getProjectByUuidRepository(projectUuid),
        enabled: Boolean(projectUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useCreateProjectService() {
    const queryClient = useQueryClient();
    return useMutation<Project, AppError, CreateProjectPayload>({
        mutationFn: (payload) => createProjectRepository(payload),
        onSuccess: (project) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.WORKSPACE(project.workspaceUuid),
            });
        },
    });
}

export function useUpdateProjectService() {
    const queryClient = useQueryClient();
    return useMutation<Project, AppError, { uuid: string; payload: UpdateProjectPayload }>({
        mutationFn: ({ uuid, payload }) => updateProjectRepository(uuid, payload),
        onSuccess: (project) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(project.uuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.WORKSPACE(project.workspaceUuid),
            });
        },
    });
}

export function useDeleteProjectService(workspaceUuid: string) {
    const queryClient = useQueryClient();
    return useMutation<void, AppError, string>({
        mutationFn: (uuid) => deleteProjectRepository(uuid),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.WORKSPACE(workspaceUuid),
            });
        },
    });
}

// Statuses
export function useProjectStatusesService(projectUuid: string) {
    return useQuery<TaskStatus[], AppError>({
        queryKey: PROJECT_QUERY_KEYS.STATUSES(projectUuid),
        queryFn: () => getProjectStatusesRepository(projectUuid),
        enabled: Boolean(projectUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useCreateProjectStatusService() {
    const queryClient = useQueryClient();
    return useMutation<TaskStatus, AppError, { projectUuid: string; payload: CreateTaskStatusPayload }>({
        mutationFn: ({ projectUuid, payload }) => createProjectStatusRepository(projectUuid, payload),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.STATUSES(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

export function useDeleteProjectStatusService() {
    const queryClient = useQueryClient();
    return useMutation<void, AppError, { projectUuid: string; statusUuid: string }>({
        mutationFn: ({ projectUuid, statusUuid }) => deleteProjectStatusRepository(projectUuid, statusUuid),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.STATUSES(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

// Types
export function useProjectTypesService(projectUuid: string) {
    return useQuery<TaskType[], AppError>({
        queryKey: PROJECT_QUERY_KEYS.TYPES(projectUuid),
        queryFn: () => getProjectTypesRepository(projectUuid),
        enabled: Boolean(projectUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useCreateProjectTypeService() {
    const queryClient = useQueryClient();
    return useMutation<TaskType, AppError, { projectUuid: string; payload: CreateTaskTypePayload }>({
        mutationFn: ({ projectUuid, payload }) => createProjectTypeRepository(projectUuid, payload),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TYPES(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

export function useDeleteProjectTypeService() {
    const queryClient = useQueryClient();
    return useMutation<void, AppError, { projectUuid: string; typeUuid: string }>({
        mutationFn: ({ projectUuid, typeUuid }) => deleteProjectTypeRepository(projectUuid, typeUuid),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TYPES(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

// Properties
export function useProjectPropertiesService(projectUuid: string) {
    return useQuery<TaskPropertyDefinition[], AppError>({
        queryKey: PROJECT_QUERY_KEYS.PROPERTIES(projectUuid),
        queryFn: () => getProjectPropertiesRepository(projectUuid),
        enabled: Boolean(projectUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useCreateProjectPropertyService() {
    const queryClient = useQueryClient();
    return useMutation<TaskPropertyDefinition, AppError, { projectUuid: string; payload: CreateTaskPropertyPayload }>({
        mutationFn: ({ projectUuid, payload }) => createProjectPropertyRepository(projectUuid, payload),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.PROPERTIES(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

export function useDeleteProjectPropertyService() {
    const queryClient = useQueryClient();
    return useMutation<void, AppError, { projectUuid: string; propUuid: string }>({
        mutationFn: ({ projectUuid, propUuid }) => deleteProjectPropertyRepository(projectUuid, propUuid),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.PROPERTIES(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

// Files
export function useProjectFilesService(projectUuid: string) {
    return useQuery<ProjectFileLink[], AppError>({
        queryKey: PROJECT_QUERY_KEYS.FILES(projectUuid),
        queryFn: () => getProjectFilesRepository(projectUuid),
        enabled: Boolean(projectUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useLinkProjectFileService() {
    const queryClient = useQueryClient();
    return useMutation<ProjectFileLink, AppError, { projectUuid: string; payload: LinkProjectFilePayload }>({
        mutationFn: ({ projectUuid, payload }) => linkProjectFileRepository(projectUuid, payload),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.FILES(projectUuid),
            });
        },
    });
}

export function useUnlinkProjectFileService() {
    const queryClient = useQueryClient();
    return useMutation<void, AppError, { projectUuid: string; fileUuid: string }>({
        mutationFn: ({ projectUuid, fileUuid }) => unlinkProjectFileRepository(projectUuid, fileUuid),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.FILES(projectUuid),
            });
        },
    });
}

// Tasks
export function useProjectTasksService(projectUuid: string) {
    return useQuery<Task[], AppError>({
        queryKey: PROJECT_QUERY_KEYS.TASKS(projectUuid),
        queryFn: () => getProjectTasksRepository(projectUuid),
        enabled: Boolean(projectUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useTaskDetailService(taskUuid: string | null) {
    return useQuery<Task, AppError>({
        queryKey: PROJECT_QUERY_KEYS.TASK_DETAIL(taskUuid || ''),
        queryFn: () => getTaskByUuidRepository(taskUuid!),
        enabled: Boolean(taskUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useCreateTaskService() {
    const queryClient = useQueryClient();
    return useMutation<Task, AppError, { projectUuid: string; payload: CreateTaskPayload }>({
        mutationFn: ({ projectUuid, payload }) => createTaskRepository(projectUuid, payload),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASKS(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

export function useUpdateTaskService() {
    const queryClient = useQueryClient();
    return useMutation<Task, AppError, { taskUuid: string; projectUuid: string; payload: UpdateTaskPayload }>({
        mutationFn: ({ taskUuid, payload }) => updateTaskRepository(taskUuid, payload),
        onSuccess: (task, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASKS(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASK_DETAIL(task.uuid),
            });
        },
    });
}

export function useMoveTaskService() {
    const queryClient = useQueryClient();
    return useMutation<Task, AppError, { taskUuid: string; projectUuid: string; payload: MoveTaskPayload }>({
        mutationFn: ({ taskUuid, payload }) => moveTaskRepository(taskUuid, payload),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASKS(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

export function useDeleteTaskService() {
    const queryClient = useQueryClient();
    return useMutation<void, AppError, { taskUuid: string; projectUuid: string }>({
        mutationFn: ({ taskUuid }) => deleteTaskRepository(taskUuid),
        onSuccess: (_data, { projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASKS(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.DETAIL(projectUuid),
            });
        },
    });
}

// Time Logs
export function useTaskTimeLogsService(taskUuid: string | null) {
    return useQuery<TaskTimeLog[], AppError>({
        queryKey: PROJECT_QUERY_KEYS.TIME_LOGS(taskUuid || ''),
        queryFn: () => getTaskTimeLogsRepository(taskUuid!),
        enabled: Boolean(taskUuid),
        staleTime: PROJECT_DEFAULTS.STALE_TIME,
    });
}

export function useCreateTaskTimeLogService() {
    const queryClient = useQueryClient();
    return useMutation<TaskTimeLog, AppError, { taskUuid: string; projectUuid: string; payload: CreateTaskTimeLogPayload }>({
        mutationFn: ({ taskUuid, payload }) => createTaskTimeLogRepository(taskUuid, payload),
        onSuccess: (_data, { taskUuid, projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TIME_LOGS(taskUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASKS(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASK_DETAIL(taskUuid),
            });
        },
    });
}

export function useDeleteTaskTimeLogService() {
    const queryClient = useQueryClient();
    return useMutation<void, AppError, { taskUuid: string; projectUuid: string; logUuid: string }>({
        mutationFn: ({ taskUuid, logUuid }) => deleteTaskTimeLogRepository(taskUuid, logUuid),
        onSuccess: (_data, { taskUuid, projectUuid }) => {
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TIME_LOGS(taskUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASKS(projectUuid),
            });
            queryClient.invalidateQueries({
                queryKey: PROJECT_QUERY_KEYS.TASK_DETAIL(taskUuid),
            });
        },
    });
}
