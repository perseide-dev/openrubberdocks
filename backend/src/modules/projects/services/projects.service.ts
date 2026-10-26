import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '@moduleProjects/entities/project.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';
import { CreateProjectDto } from '@moduleProjects/dto/create-project.dto';
import { UpdateProjectDto } from '@moduleProjects/dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Workspace)
        private readonly workspaceRepository: Repository<Workspace>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(TaskStatus)
        private readonly taskStatusRepository: Repository<TaskStatus>,
        @InjectRepository(TaskType)
        private readonly taskTypeRepository: Repository<TaskType>,
    ) {}

    async create(dto: CreateProjectDto, userUuid?: string): Promise<Project> {
        const workspace = await this.workspaceRepository.findOne({
            where: { uuid: dto.workspaceUuid },
        });

        if (!workspace) {
            throw new NotFoundException(`Workspace with uuid ${dto.workspaceUuid} not found`);
        }

        let user: User | null = null;
        if (userUuid) {
            user = await this.userRepository.findOne({ where: { uuid: userUuid } });
        }

        const project = this.projectRepository.create({
            name: dto.name,
            description: dto.description || null,
            icon: dto.icon || null,
            coverImage: dto.coverImage || null,
            color: dto.color || '#000000',
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
            workspace,
            workspaceId: workspace.id,
            workspaceUuid: workspace.uuid,
            createdBy: user,
            createdById: user ? user.id : null,
            createdByUuid: user ? user.uuid : (userUuid || null),
        });

        const savedProject = await this.projectRepository.save(project);

        // Seed default statuses
        const defaultStatuses = [
            { name: 'Backlog', category: 'TODO' as const, color: '#71717A', orderIndex: 0, isDefault: false },
            { name: 'To Do', category: 'TODO' as const, color: '#3B82F6', orderIndex: 1, isDefault: true },
            { name: 'In Progress', category: 'IN_PROGRESS' as const, color: '#F59E0B', orderIndex: 2, isDefault: false },
            { name: 'Review', category: 'IN_PROGRESS' as const, color: '#8B5CF6', orderIndex: 3, isDefault: false },
            { name: 'Done', category: 'DONE' as const, color: '#10B981', orderIndex: 4, isDefault: false },
        ];

        const statusEntities = defaultStatuses.map((s) =>
            this.taskStatusRepository.create({
                ...s,
                project: savedProject,
                projectId: savedProject.id,
                projectUuid: savedProject.uuid,
            }),
        );
        await this.taskStatusRepository.save(statusEntities);

        // Seed default task types
        const defaultTypes = [
            { name: 'Task', icon: 'check_circle', color: '#3B82F6', isDefault: true },
            { name: 'Bug', icon: 'bug_report', color: '#EF4444', isDefault: false },
            { name: 'Feature', icon: 'star', color: '#10B981', isDefault: false },
            { name: 'Milestone', icon: 'flag', color: '#8B5CF6', isDefault: false },
        ];

        const typeEntities = defaultTypes.map((t) =>
            this.taskTypeRepository.create({
                ...t,
                project: savedProject,
                projectId: savedProject.id,
                projectUuid: savedProject.uuid,
            }),
        );
        await this.taskTypeRepository.save(typeEntities);

        return this.findOne(savedProject.uuid);
    }

    async findAll(workspaceUuid: string): Promise<Project[]> {
        return this.projectRepository.find({
            where: { workspaceUuid },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(uuid: string): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { uuid },
            relations: ['statuses', 'types', 'propertyDefinitions'],
        });

        if (!project) {
            throw new NotFoundException(`Project with uuid ${uuid} not found`);
        }

        return project;
    }

    async update(uuid: string, dto: UpdateProjectDto): Promise<Project> {
        const project = await this.findOne(uuid);

        if (dto.name !== undefined) project.name = dto.name;
        if (dto.description !== undefined) project.description = dto.description;
        if (dto.icon !== undefined) project.icon = dto.icon;
        if (dto.coverImage !== undefined) project.coverImage = dto.coverImage;
        if (dto.color !== undefined) project.color = dto.color;
        if (dto.startDate !== undefined) project.startDate = dto.startDate ? new Date(dto.startDate) : null;
        if (dto.targetDate !== undefined) project.targetDate = dto.targetDate ? new Date(dto.targetDate) : null;

        return this.projectRepository.save(project);
    }

    async delete(uuid: string): Promise<void> {
        const project = await this.findOne(uuid);
        await this.projectRepository.remove(project);
    }
}
