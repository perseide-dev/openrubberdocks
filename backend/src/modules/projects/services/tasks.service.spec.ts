import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from '@moduleProjects/services/tasks.service';
import { Task } from '@moduleProjects/entities/task.entity';
import { Project } from '@moduleProjects/entities/project.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';
import { User } from '@moduleUsers/entities/user.entity';

describe('TasksService', () => {
    let service: TasksService;
    let taskRepo: any;
    let projectRepo: any;
    let statusRepo: any;
    let typeRepo: any;
    let userRepo: any;

    const mockProject = { id: 1, uuid: 'proj-123' };
    const mockStatus = { id: 10, uuid: 'status-todo', projectId: 1 };
    const mockType = { id: 20, uuid: 'type-task', projectId: 1 };
    const mockUser = { id: 30, uuid: 'user-1' };
    const mockTask = {
        id: 100,
        uuid: 'task-123',
        title: 'Build Login',
        projectId: 1,
        projectUuid: 'proj-123',
        statusId: 10,
        statusUuid: 'status-todo',
        typeId: 20,
        typeUuid: 'type-task',
        orderIndex: 0,
        customProperties: {},
    };

    beforeEach(async () => {
        taskRepo = {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation(async (item) => ({ id: 100, uuid: 'task-123', ...item })),
            find: jest.fn().mockResolvedValue([mockTask]),
            findOne: jest.fn().mockResolvedValue(mockTask),
            count: jest.fn().mockResolvedValue(0),
            remove: jest.fn().mockResolvedValue(undefined),
        };

        projectRepo = {
            findOne: jest.fn().mockResolvedValue(mockProject),
        };

        statusRepo = {
            findOne: jest.fn().mockResolvedValue(mockStatus),
        };

        typeRepo = {
            findOne: jest.fn().mockResolvedValue(mockType),
        };

        userRepo = {
            find: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: getRepositoryToken(Task), useValue: taskRepo },
                { provide: getRepositoryToken(Project), useValue: projectRepo },
                { provide: getRepositoryToken(TaskStatus), useValue: statusRepo },
                { provide: getRepositoryToken(TaskType), useValue: typeRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create task and resolve status and type defaults', async () => {
            const result = await service.create(
                'proj-123',
                { title: 'Build Login', statusUuid: 'status-todo', typeUuid: 'type-task' },
                'user-1',
            );
            expect(result).toBeDefined();
            expect(taskRepo.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException if project not found', async () => {
            projectRepo.findOne.mockResolvedValue(null);
            await expect(
                service.create('proj-999', { title: 'Test' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return tasks for a project', async () => {
            const result = await service.findAll('proj-123');
            expect(result).toEqual([mockTask]);
        });
    });

    describe('move', () => {
        it('should change status and orderIndex', async () => {
            const result = await service.move('task-123', {
                statusUuid: 'status-todo',
                orderIndex: 3,
            });
            expect(result).toBeDefined();
            expect(taskRepo.save).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should delete task', async () => {
            await service.delete('task-123');
            expect(taskRepo.remove).toHaveBeenCalled();
        });
    });
});
