import { baseAPIrequest } from '@http-base/baseAPIrequest';
import {
    PROJECT_ENDPOINTS,
    PROJECT_RESOURCE_TYPES,
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

// Projects
export async function getWorkspaceProjectsRepository(workspaceUuid: string): Promise<Project[]> {
    return baseAPIrequest.get<Project[]>(PROJECT_ENDPOINTS.BASE, {
        searchParams: { workspaceUuid },
    });
}

export async function getProjectByUuidRepository(uuid: string): Promise<Project> {
    return baseAPIrequest.get<Project>(PROJECT_ENDPOINTS.BY_UUID(uuid));
}

export async function createProjectRepository(payload: CreateProjectPayload): Promise<Project> {
    return baseAPIrequest.post<Project, CreateProjectPayload>(
        PROJECT_ENDPOINTS.BASE,
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.PROJECTS },
    );
}

export async function updateProjectRepository(
    uuid: string,
    payload: UpdateProjectPayload,
): Promise<Project> {
    return baseAPIrequest.patch<Project, UpdateProjectPayload>(
        PROJECT_ENDPOINTS.BY_UUID(uuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.PROJECTS },
    );
}

export async function deleteProjectRepository(uuid: string): Promise<void> {
    return baseAPIrequest.delete(PROJECT_ENDPOINTS.BY_UUID(uuid));
}

// Statuses
export async function getProjectStatusesRepository(projectUuid: string): Promise<TaskStatus[]> {
    return baseAPIrequest.get<TaskStatus[]>(PROJECT_ENDPOINTS.STATUSES(projectUuid));
}

export async function createProjectStatusRepository(
    projectUuid: string,
    payload: CreateTaskStatusPayload,
): Promise<TaskStatus> {
    return baseAPIrequest.post<TaskStatus, CreateTaskStatusPayload>(
        PROJECT_ENDPOINTS.STATUSES(projectUuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.STATUSES },
    );
}

export async function deleteProjectStatusRepository(
    projectUuid: string,
    statusUuid: string,
): Promise<void> {
    return baseAPIrequest.delete(PROJECT_ENDPOINTS.STATUS_BY_UUID(projectUuid, statusUuid));
}

// Types
export async function getProjectTypesRepository(projectUuid: string): Promise<TaskType[]> {
    return baseAPIrequest.get<TaskType[]>(PROJECT_ENDPOINTS.TYPES(projectUuid));
}

export async function createProjectTypeRepository(
    projectUuid: string,
    payload: CreateTaskTypePayload,
): Promise<TaskType> {
    return baseAPIrequest.post<TaskType, CreateTaskTypePayload>(
        PROJECT_ENDPOINTS.TYPES(projectUuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.TYPES },
    );
}

export async function deleteProjectTypeRepository(
    projectUuid: string,
    typeUuid: string,
): Promise<void> {
    return baseAPIrequest.delete(PROJECT_ENDPOINTS.TYPE_BY_UUID(projectUuid, typeUuid));
}

// Properties
export async function getProjectPropertiesRepository(
    projectUuid: string,
): Promise<TaskPropertyDefinition[]> {
    return baseAPIrequest.get<TaskPropertyDefinition[]>(PROJECT_ENDPOINTS.PROPERTIES(projectUuid));
}

export async function createProjectPropertyRepository(
    projectUuid: string,
    payload: CreateTaskPropertyPayload,
): Promise<TaskPropertyDefinition> {
    return baseAPIrequest.post<TaskPropertyDefinition, CreateTaskPropertyPayload>(
        PROJECT_ENDPOINTS.PROPERTIES(projectUuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.PROPERTIES },
    );
}

export async function deleteProjectPropertyRepository(
    projectUuid: string,
    propUuid: string,
): Promise<void> {
    return baseAPIrequest.delete(PROJECT_ENDPOINTS.PROPERTY_BY_UUID(projectUuid, propUuid));
}

// Files
export async function getProjectFilesRepository(projectUuid: string): Promise<ProjectFileLink[]> {
    return baseAPIrequest.get<ProjectFileLink[]>(PROJECT_ENDPOINTS.FILES(projectUuid));
}

export async function linkProjectFileRepository(
    projectUuid: string,
    payload: LinkProjectFilePayload,
): Promise<ProjectFileLink> {
    return baseAPIrequest.post<ProjectFileLink, LinkProjectFilePayload>(
        PROJECT_ENDPOINTS.FILES(projectUuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.FILE_LINKS },
    );
}

export async function unlinkProjectFileRepository(
    projectUuid: string,
    fileUuid: string,
): Promise<void> {
    return baseAPIrequest.delete(PROJECT_ENDPOINTS.FILE_BY_UUID(projectUuid, fileUuid));
}

// Tasks
export async function getProjectTasksRepository(projectUuid: string): Promise<Task[]> {
    return baseAPIrequest.get<Task[]>(PROJECT_ENDPOINTS.TASKS(projectUuid));
}

export async function getTaskByUuidRepository(taskUuid: string): Promise<Task> {
    return baseAPIrequest.get<Task>(PROJECT_ENDPOINTS.TASK_BY_UUID(taskUuid));
}

export async function createTaskRepository(
    projectUuid: string,
    payload: CreateTaskPayload,
): Promise<Task> {
    return baseAPIrequest.post<Task, CreateTaskPayload>(
        PROJECT_ENDPOINTS.TASKS(projectUuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.TASKS },
    );
}

export async function updateTaskRepository(
    taskUuid: string,
    payload: UpdateTaskPayload,
): Promise<Task> {
    return baseAPIrequest.patch<Task, UpdateTaskPayload>(
        PROJECT_ENDPOINTS.TASK_BY_UUID(taskUuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.TASKS },
    );
}

export async function moveTaskRepository(
    taskUuid: string,
    payload: MoveTaskPayload,
): Promise<Task> {
    return baseAPIrequest.patch<Task, MoveTaskPayload>(
        PROJECT_ENDPOINTS.MOVE_TASK(taskUuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.TASKS },
    );
}

export async function deleteTaskRepository(taskUuid: string): Promise<void> {
    return baseAPIrequest.delete(PROJECT_ENDPOINTS.TASK_BY_UUID(taskUuid));
}

// Time Logs
export async function getTaskTimeLogsRepository(taskUuid: string): Promise<TaskTimeLog[]> {
    return baseAPIrequest.get<TaskTimeLog[]>(PROJECT_ENDPOINTS.TIME_LOGS(taskUuid));
}

export async function createTaskTimeLogRepository(
    taskUuid: string,
    payload: CreateTaskTimeLogPayload,
): Promise<TaskTimeLog> {
    return baseAPIrequest.post<TaskTimeLog, CreateTaskTimeLogPayload>(
        PROJECT_ENDPOINTS.TIME_LOGS(taskUuid),
        payload,
        { resourceType: PROJECT_RESOURCE_TYPES.TIME_LOGS },
    );
}

export async function deleteTaskTimeLogRepository(
    taskUuid: string,
    logUuid: string,
): Promise<void> {
    return baseAPIrequest.delete(PROJECT_ENDPOINTS.TIME_LOG_BY_UUID(taskUuid, logUuid));
}
