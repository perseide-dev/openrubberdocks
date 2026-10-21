import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '@moduleProjects/entities/project.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';
import { TaskPropertyDefinition } from '@moduleProjects/entities/task-property-definition.entity';
import { ProjectFileLink } from '@moduleProjects/entities/project-file-link.entity';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { CreateTaskStatusDto } from '@moduleProjects/dto/create-task-status.dto';
import { CreateTaskTypeDto } from '@moduleProjects/dto/create-task-type.dto';
import { CreateTaskPropertyDto } from '@moduleProjects/dto/create-task-property.dto';

@Injectable()
export class TaskConfigurationService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(TaskStatus)
        private readonly statusRepository: Repository<TaskStatus>,
        @InjectRepository(TaskType)
        private readonly typeRepository: Repository<TaskType>,
        @InjectRepository(TaskPropertyDefinition)
        private readonly propertyRepository: Repository<TaskPropertyDefinition>,
        @InjectRepository(ProjectFileLink)
        private readonly fileLinkRepository: Repository<ProjectFileLink>,
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
    ) {}

    private async getProject(projectUuid: string): Promise<Project> {
        const project = await this.projectRepository.findOne({ where: { uuid: projectUuid } });
        if (!project) {
            throw new NotFoundException(`Project with uuid ${projectUuid} not found`);
        }
        return project;
    }

    // --- Task Statuses ---
    async findStatuses(projectUuid: string): Promise<TaskStatus[]> {
        await this.getProject(projectUuid);
        return this.statusRepository.find({
            where: { projectUuid },
            order: { orderIndex: 'ASC' },
        });
    }

    async createStatus(projectUuid: string, dto: CreateTaskStatusDto): Promise<TaskStatus> {
        const project = await this.getProject(projectUuid);
        const status = this.statusRepository.create({
            name: dto.name,
            category: dto.category,
            color: dto.color || '#71717A',
            orderIndex: dto.orderIndex ?? 0,
            project,
            projectId: project.id,
            projectUuid: project.uuid,
        });
        return this.statusRepository.save(status);
    }

    async deleteStatus(projectUuid: string, statusUuid: string): Promise<void> {
        const status = await this.statusRepository.findOne({
            where: { uuid: statusUuid, projectUuid },
        });
        if (!status) {
            throw new NotFoundException(`Task status ${statusUuid} not found in project`);
        }
        await this.statusRepository.remove(status);
    }

    // --- Task Types ---
    async findTypes(projectUuid: string): Promise<TaskType[]> {
        await this.getProject(projectUuid);
        return this.typeRepository.find({
            where: { projectUuid },
            order: { createdAt: 'ASC' },
        });
    }

    async createType(projectUuid: string, dto: CreateTaskTypeDto): Promise<TaskType> {
        const project = await this.getProject(projectUuid);
        const type = this.typeRepository.create({
            name: dto.name,
            icon: dto.icon || 'task',
            color: dto.color || '#3B82F6',
            project,
            projectId: project.id,
            projectUuid: project.uuid,
        });
        return this.typeRepository.save(type);
    }

    async deleteType(projectUuid: string, typeUuid: string): Promise<void> {
        const type = await this.typeRepository.findOne({
            where: { uuid: typeUuid, projectUuid },
        });
        if (!type) {
            throw new NotFoundException(`Task type ${typeUuid} not found in project`);
        }
        await this.typeRepository.remove(type);
    }

    // --- Task Properties (Notion-like) ---
    async findProperties(projectUuid: string): Promise<TaskPropertyDefinition[]> {
        await this.getProject(projectUuid);
        return this.propertyRepository.find({
            where: { projectUuid },
            order: { orderIndex: 'ASC' },
        });
    }

    async createProperty(projectUuid: string, dto: CreateTaskPropertyDto): Promise<TaskPropertyDefinition> {
        const project = await this.getProject(projectUuid);
        const prop = this.propertyRepository.create({
            name: dto.name,
            type: dto.type,
            options: dto.options || [],
            orderIndex: dto.orderIndex ?? 0,
            project,
            projectId: project.id,
            projectUuid: project.uuid,
        });
        return this.propertyRepository.save(prop);
    }

    async deleteProperty(projectUuid: string, propertyUuid: string): Promise<void> {
        const prop = await this.propertyRepository.findOne({
            where: { uuid: propertyUuid, projectUuid },
        });
        if (!prop) {
            throw new NotFoundException(`Property definition ${propertyUuid} not found in project`);
        }
        await this.propertyRepository.remove(prop);
    }

    // --- Project File Links ---
    async findLinkedFiles(projectUuid: string): Promise<ProjectFileLink[]> {
        await this.getProject(projectUuid);
        return this.fileLinkRepository.find({
            where: { projectUuid },
            relations: ['file'],
            order: { attachedAt: 'DESC' },
        });
    }

    async linkFile(projectUuid: string, fileUuid: string): Promise<ProjectFileLink> {
        const project = await this.getProject(projectUuid);
        const file = await this.fileRepository.findOne({ where: { uuid: fileUuid } });
        if (!file) {
            throw new NotFoundException(`File with uuid ${fileUuid} not found`);
        }

        const existing = await this.fileLinkRepository.findOne({
            where: { projectId: project.id, fileId: file.id },
        });
        if (existing) {
            throw new ConflictException(`File is already linked to this project`);
        }

        const link = this.fileLinkRepository.create({
            project,
            projectId: project.id,
            projectUuid: project.uuid,
            file,
            fileId: file.id,
            fileUuid: file.uuid,
        });
        return this.fileLinkRepository.save(link);
    }

    async unlinkFile(projectUuid: string, fileUuid: string): Promise<void> {
        const link = await this.fileLinkRepository.findOne({
            where: { projectUuid, fileUuid },
        });
        if (!link) {
            throw new NotFoundException(`File link not found in project`);
        }
        await this.fileLinkRepository.remove(link);
    }
}
