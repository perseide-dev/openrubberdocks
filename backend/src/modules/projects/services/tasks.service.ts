import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '@moduleProjects/entities/task.entity';
import { Project } from '@moduleProjects/entities/project.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { CreateTaskDto } from '@moduleProjects/dto/create-task.dto';
import { UpdateTaskDto } from '@moduleProjects/dto/update-task.dto';
import { MoveTaskDto } from '@moduleProjects/dto/move-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(TaskStatus)
        private readonly statusRepository: Repository<TaskStatus>,
        @InjectRepository(TaskType)
        private readonly typeRepository: Repository<TaskType>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(projectUuid: string, dto: CreateTaskDto, userUuid?: string): Promise<Task> {
        const project = await this.projectRepository.findOne({ where: { uuid: projectUuid } });
        if (!project) {
            throw new NotFoundException(`Project with uuid ${projectUuid} not found`);
        }

        // Resolve Status
        let status: TaskStatus | null = null;
        if (dto.statusUuid) {
            status = await this.statusRepository.findOne({
                where: { uuid: dto.statusUuid, projectUuid },
            });
            if (!status) throw new NotFoundException(`Status ${dto.statusUuid} not found`);
        } else {
            status = await this.statusRepository.findOne({
                where: { projectUuid, isDefault: true },
            }) || await this.statusRepository.findOne({
                where: { projectUuid },
                order: { orderIndex: 'ASC' },
            });
            if (!status) throw new NotFoundException(`No statuses available in project`);
        }

        // Resolve Type
        let type: TaskType | null = null;
        if (dto.typeUuid) {
            type = await this.typeRepository.findOne({
                where: { uuid: dto.typeUuid, projectUuid },
            });
            if (!type) throw new NotFoundException(`Type ${dto.typeUuid} not found`);
        } else {
            type = await this.typeRepository.findOne({
                where: { projectUuid, isDefault: true },
            }) || await this.typeRepository.findOne({
                where: { projectUuid },
                order: { createdAt: 'ASC' },
            });
            if (!type) throw new NotFoundException(`No types available in project`);
        }

        // Resolve Parent Task (Subtask)
        let parentTask: Task | null = null;
        if (dto.parentTaskUuid) {
            parentTask = await this.taskRepository.findOne({
                where: { uuid: dto.parentTaskUuid, projectUuid },
            });
            if (!parentTask) throw new NotFoundException(`Parent task ${dto.parentTaskUuid} not found`);
        }

        // Resolve Assignees
        let assignees: User[] = [];
        if (dto.assigneeUuids && dto.assigneeUuids.length > 0) {
            assignees = await this.userRepository.find({
                where: { uuid: In(dto.assigneeUuids) },
            });
        }

        // Resolve Creator
        let creator: User | null = null;
        if (userUuid) {
            creator = await this.userRepository.findOne({ where: { uuid: userUuid } });
        }

        // Calculate orderIndex if not provided
        let orderIndex = dto.orderIndex;
        if (orderIndex === undefined) {
            orderIndex = await this.taskRepository.count({
                where: { projectId: project.id, statusId: status.id },
            });
        }

        const task = this.taskRepository.create({
            title: dto.title,
            description: dto.description || null,
            project,
            projectId: project.id,
            projectUuid: project.uuid,
            status,
            statusId: status.id,
            statusUuid: status.uuid,
            type,
            typeId: type.id,
            typeUuid: type.uuid,
            parentTask,
            parentTaskId: parentTask ? parentTask.id : null,
            parentTaskUuid: parentTask ? parentTask.uuid : null,
            orderIndex,
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            estimatedMinutes: dto.estimatedMinutes ?? null,
            customProperties: dto.customProperties || {},
            assignees,
            createdBy: creator,
            createdById: creator ? creator.id : null,
            createdByUuid: creator ? creator.uuid : (userUuid || null),
        });

        const saved = await this.taskRepository.save(task);
        return this.findOne(saved.uuid);
    }

    async findAll(projectUuid: string): Promise<Task[]> {
        return this.taskRepository.find({
            where: { projectUuid },
            relations: ['status', 'type', 'assignees', 'subtasks'],
            order: { orderIndex: 'ASC', createdAt: 'ASC' },
        });
    }

    async findOne(taskUuid: string): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { uuid: taskUuid },
            relations: ['status', 'type', 'assignees', 'subtasks', 'timeLogs', 'dependencies', 'project'],
        });

        if (!task) {
            throw new NotFoundException(`Task with uuid ${taskUuid} not found`);
        }

        return task;
    }

    async update(taskUuid: string, dto: UpdateTaskDto): Promise<Task> {
        const task = await this.findOne(taskUuid);

        if (dto.title !== undefined) task.title = dto.title;
        if (dto.description !== undefined) task.description = dto.description;
        if (dto.orderIndex !== undefined) task.orderIndex = dto.orderIndex;
        if (dto.startDate !== undefined) task.startDate = dto.startDate ? new Date(dto.startDate) : null;
        if (dto.dueDate !== undefined) task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
        if (dto.estimatedMinutes !== undefined) task.estimatedMinutes = dto.estimatedMinutes;
        if (dto.customProperties !== undefined) task.customProperties = dto.customProperties;

        if (dto.statusUuid) {
            const status = await this.statusRepository.findOne({
                where: { uuid: dto.statusUuid, projectId: task.projectId },
            });
            if (!status) throw new NotFoundException(`Status ${dto.statusUuid} not found`);
            task.status = status;
            task.statusId = status.id;
            task.statusUuid = status.uuid;
        }

        if (dto.typeUuid) {
            const type = await this.typeRepository.findOne({
                where: { uuid: dto.typeUuid, projectId: task.projectId },
            });
            if (!type) throw new NotFoundException(`Type ${dto.typeUuid} not found`);
            task.type = type;
            task.typeId = type.id;
            task.typeUuid = type.uuid;
        }

        if (dto.parentTaskUuid !== undefined) {
            if (dto.parentTaskUuid === null) {
                task.parentTask = null;
                task.parentTaskId = null;
                task.parentTaskUuid = null;
            } else {
                const parent = await this.taskRepository.findOne({
                    where: { uuid: dto.parentTaskUuid, projectId: task.projectId },
                });
                if (!parent) throw new NotFoundException(`Parent task ${dto.parentTaskUuid} not found`);
                task.parentTask = parent;
                task.parentTaskId = parent.id;
                task.parentTaskUuid = parent.uuid;
            }
        }

        if (dto.assigneeUuids !== undefined) {
            if (dto.assigneeUuids.length === 0) {
                task.assignees = [];
            } else {
                task.assignees = await this.userRepository.find({
                    where: { uuid: In(dto.assigneeUuids) },
                });
            }
        }

        await this.taskRepository.save(task);
        return this.findOne(task.uuid);
    }

    async move(taskUuid: string, dto: MoveTaskDto): Promise<Task> {
        const task = await this.findOne(taskUuid);
        const status = await this.statusRepository.findOne({
            where: { uuid: dto.statusUuid, projectId: task.projectId },
        });

        if (!status) {
            throw new NotFoundException(`Status with uuid ${dto.statusUuid} not found`);
        }

        task.status = status;
        task.statusId = status.id;
        task.statusUuid = status.uuid;
        task.orderIndex = dto.orderIndex;

        await this.taskRepository.save(task);
        return this.findOne(task.uuid);
    }

    async delete(taskUuid: string): Promise<void> {
        const task = await this.findOne(taskUuid);
        await this.taskRepository.remove(task);
    }
}
