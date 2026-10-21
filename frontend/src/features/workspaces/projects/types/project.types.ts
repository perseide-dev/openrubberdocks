export type TaskStatusCategory = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export type ProjectTab = 'board' | 'timeline' | 'tasks' | 'files' | 'settings';

export type TaskPropertyType =
    | 'text'
    | 'number'
    | 'select'
    | 'multi_select'
    | 'date'
    | 'checkbox'
    | 'url'
    | 'user';

export interface PropertyOption {
    id: string;
    label: string;
    value?: string;
    color?: string;
}

export type TaskDependencyType = 'BLOCKS' | 'BLOCKED_BY' | 'RELATES_TO';

export interface ProjectUserSummary {
    id: number;
    uuid: string;
    username: string;
    rubberHandle?: string;
}

export interface TaskStatus {
    id: number;
    uuid: string;
    projectId: number;
    projectUuid: string;
    name: string;
    category: TaskStatusCategory;
    color: string;
    orderIndex: number;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TaskType {
    id: number;
    uuid: string;
    projectId: number;
    projectUuid: string;
    name: string;
    icon: string;
    color: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TaskPropertyDefinition {
    id: number;
    uuid: string;
    projectId: number;
    projectUuid: string;
    name: string;
    type: TaskPropertyType;
    options: PropertyOption[] | null;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

export interface TaskTimeLog {
    id: number;
    uuid: string;
    taskId: number;
    taskUuid: string;
    userId: number | null;
    userUuid: string | null;
    user?: ProjectUserSummary | null;
    minutes: number;
    date: string;
    description: string | null;
    createdAt: string;
}

export interface TaskDependency {
    id: number;
    uuid: string;
    taskId: number;
    taskUuid: string;
    dependsOnTaskId: number;
    dependsOnTaskUuid: string;
    dependsOnTask?: Task;
    type: TaskDependencyType;
    createdAt: string;
}

export interface ProjectFileLink {
    id: number;
    uuid: string;
    projectId: number;
    projectUuid: string;
    fileId: number;
    fileUuid: string;
    file?: {
        id: number;
        uuid: string;
        title: string;
        icon: string | null;
        updatedAt: string;
    };
    attachedAt: string;
}

export interface Task {
    id: number;
    uuid: string;
    projectId: number;
    projectUuid: string;
    statusId: number;
    statusUuid: string;
    status?: TaskStatus;
    typeId: number;
    typeUuid: string;
    type?: TaskType;
    parentTaskId: number | null;
    parentTaskUuid: string | null;
    parentTask?: Task | null;
    subtasks?: Task[];
    title: string;
    description: string | null;
    orderIndex: number;
    startDate: string | null;
    dueDate: string | null;
    estimatedMinutes: number | null;
    customProperties: Record<string, unknown>;
    createdById: number | null;
    createdByUuid: string | null;
    assignees?: ProjectUserSummary[];
    timeLogs?: TaskTimeLog[];
    dependencies?: TaskDependency[];
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    icon: string | null;
    coverImage: string | null;
    color: string | null;
    startDate: string | null;
    targetDate: string | null;
    workspaceId: number;
    workspaceUuid: string;
    createdById: number | null;
    createdByUuid: string | null;
    statuses?: TaskStatus[];
    types?: TaskType[];
    propertyDefinitions?: TaskPropertyDefinition[];
    tasks?: Task[];
    createdAt: string;
    updatedAt: string;
}

// Payload Types
export interface CreateProjectPayload extends Record<string, unknown> {
    name: string;
    description?: string;
    icon?: string;
    coverImage?: string;
    color?: string;
    workspaceUuid: string;
    startDate?: string;
    targetDate?: string;
}

export interface UpdateProjectPayload extends Record<string, unknown> {
    name?: string;
    description?: string;
    icon?: string;
    coverImage?: string;
    color?: string;
    startDate?: string;
    targetDate?: string;
}

export interface CreateTaskPayload extends Record<string, unknown> {
    title: string;
    description?: string;
    statusUuid?: string;
    typeUuid?: string;
    parentTaskUuid?: string;
    orderIndex?: number;
    startDate?: string;
    dueDate?: string;
    estimatedMinutes?: number;
    customProperties?: Record<string, unknown>;
    assigneeUuids?: string[];
}

export interface UpdateTaskPayload extends Record<string, unknown> {
    title?: string;
    description?: string;
    statusUuid?: string;
    typeUuid?: string;
    parentTaskUuid?: string | null;
    orderIndex?: number;
    startDate?: string | null;
    dueDate?: string | null;
    estimatedMinutes?: number | null;
    customProperties?: Record<string, unknown>;
    assigneeUuids?: string[];
}

export interface MoveTaskPayload extends Record<string, unknown> {
    statusUuid: string;
    orderIndex: number;
}

export interface CreateTaskStatusPayload extends Record<string, unknown> {
    name: string;
    category: TaskStatusCategory;
    color?: string;
    orderIndex?: number;
}

export interface CreateTaskTypePayload extends Record<string, unknown> {
    name: string;
    icon?: string;
    color?: string;
}

export interface CreateTaskPropertyPayload extends Record<string, unknown> {
    name: string;
    type: TaskPropertyType;
    options?: PropertyOption[];
    orderIndex?: number;
}

export interface CreateTaskTimeLogPayload extends Record<string, unknown> {
    minutes: number;
    date?: string;
    description?: string;
}

export interface LinkProjectFilePayload extends Record<string, unknown> {
    fileUuid: string;
}

// Component Props Interfaces
export interface ProjectsTabContentProps {
    workspaceUuid: string;
    canManage: boolean;
}

export interface CreateProjectModalProps {
    open: boolean;
    onClose: () => void;
    workspaceUuid: string;
}

export interface TaskCardProps {
    task: Task;
    onTaskClick: (task: Task) => void;
}

export interface KanbanColumnProps {
    status: TaskStatus;
    tasks: Task[];
    canManage: boolean;
    onTaskClick: (task: Task) => void;
    onAddTask: (statusUuid: string) => void;
    onMoveTask: (taskUuid: string, targetStatusUuid: string, newOrderIndex: number) => void;
}

export interface KanbanBoardProps {
    projectUuid: string;
    statuses: TaskStatus[];
    tasks: Task[];
    canManage: boolean;
    onTaskClick: (task: Task) => void;
    onAddTask: (statusUuid: string) => void;
    onMoveTask: (taskUuid: string, targetStatusUuid: string, newOrderIndex: number) => void;
}

export interface TimelineViewProps {
    projectUuid: string;
    tasks: Task[];
    canManage: boolean;
    onTaskClick: (task: Task) => void;
    onOpenTimeLog: (task: Task) => void;
}

export interface TimeLogModalProps {
    open: boolean;
    task: Task | null;
    onClose: () => void;
}

export interface TasksTableProps {
    tasks: Task[];
    properties: TaskPropertyDefinition[];
    canManage: boolean;
    onTaskClick: (task: Task) => void;
    onDeleteTask?: (taskUuid: string) => void;
}

export interface ProjectFilesTabProps {
    projectUuid: string;
    workspaceUuid: string;
    canManage: boolean;
}

export interface ProjectSettingsTabProps {
    projectUuid: string;
    statuses: TaskStatus[];
    types: TaskType[];
    properties: TaskPropertyDefinition[];
    canManage: boolean;
}

export interface TaskDetailModalProps {
    open: boolean;
    taskUuid: string | null;
    projectUuid: string;
    statuses: TaskStatus[];
    types: TaskType[];
    properties: TaskPropertyDefinition[];
    canManage: boolean;
    onClose: () => void;
}
