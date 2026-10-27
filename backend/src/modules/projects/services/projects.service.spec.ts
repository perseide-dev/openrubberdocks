import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from '@moduleProjects/services/projects.service';
import { Project } from '@moduleProjects/entities/project.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';

describe('ProjectsService', () => {
    let service: ProjectsService;
    let projectRepo: any;
    let workspaceRepo: any;
    let userRepo: any;
    let statusRepo: any;
    let typeRepo: any;

    const mockWorkspace = { id: 1, uuid: 'ws-123', name: 'Dev Workspace' };
    const mockUser = { id: 10, uuid: 'usr-123', username: 'admin' };
    const mockProject = {
        id: 100,
        uuid: 'proj-123',
        name: 'Project Apollo',
        workspaceId: 1,
        workspaceUuid: 'ws-123',
        statuses: [],
        types: [],
        propertyDefinitions: [],
    };

    beforeEach(async () => {
        projectRepo = {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation(async (item) => ({ id: 100, uuid: 'proj-123', ...item })),
            find: jest.fn().mockResolvedValue([mockProject]),
            findOne: jest.fn().mockResolvedValue(mockProject),
            remove: jest.fn().mockResolvedValue(undefined),
        };

        workspaceRepo = {
            findOne: jest.fn().mockResolvedValue(mockWorkspace),
        };

        userRepo = {
            findOne: jest.fn().mockResolvedValue(mockUser),
        };

        statusRepo = {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation(async (item) => ({ id: 1, ...item })),
        };

        typeRepo = {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation(async (item) => ({ id: 1, ...item })),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                { provide: getRepositoryToken(Project), useValue: projectRepo },
                { provide: getRepositoryToken(Workspace), useValue: workspaceRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
                { provide: getRepositoryToken(TaskStatus), useValue: statusRepo },
                { provide: getRepositoryToken(TaskType), useValue: typeRepo },
            ],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create project and automatically seed default statuses and types', async () => {
            const result = await service.create(
                { name: 'Project Apollo', workspaceUuid: 'ws-123' },
                'usr-123',
            );

            expect(result).toBeDefined();
            expect(workspaceRepo.findOne).toHaveBeenCalledWith({ where: { uuid: 'ws-123' } });
            expect(statusRepo.create).toHaveBeenCalled();
            expect(typeRepo.create).toHaveBeenCalled();
        });

        it('should throw NotFoundException if workspace does not exist', async () => {
            workspaceRepo.findOne.mockResolvedValue(null);

            await expect(
                service.create({ name: 'Project Apollo', workspaceUuid: 'ws-999' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return projects for a workspace', async () => {
            const result = await service.findAll('ws-123');
            expect(result).toEqual([mockProject]);
            expect(projectRepo.find).toHaveBeenCalledWith({
                where: { workspaceUuid: 'ws-123' },
                order: { createdAt: 'DESC' },
            });
        });
    });

    describe('findOne', () => {
        it('should return a single project', async () => {
            const result = await service.findOne('proj-123');
            expect(result).toEqual(mockProject);
        });

        it('should throw NotFoundException if project not found', async () => {
            projectRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne('proj-999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update and return project', async () => {
            const result = await service.update('proj-123', { name: 'Apollo Renamed' });
            expect(result).toBeDefined();
            expect(projectRepo.save).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should remove project', async () => {
            await service.delete('proj-123');
            expect(projectRepo.remove).toHaveBeenCalled();
        });
    });
});
