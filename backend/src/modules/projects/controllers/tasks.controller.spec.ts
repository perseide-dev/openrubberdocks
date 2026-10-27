import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '@moduleProjects/controllers/tasks.controller';
import { TasksService } from '@moduleProjects/services/tasks.service';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

describe('TasksController', () => {
    let controller: TasksController;
    let service: any;

    const mockTask = { id: 1, uuid: 'task-123', title: 'Test Task' };

    beforeEach(async () => {
        service = {
            create: jest.fn().mockResolvedValue(mockTask),
            findAll: jest.fn().mockResolvedValue([mockTask]),
            findOne: jest.fn().mockResolvedValue(mockTask),
            update: jest.fn().mockResolvedValue(mockTask),
            move: jest.fn().mockResolvedValue(mockTask),
            delete: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                { provide: TasksService, useValue: service },
                { provide: AccessControlService, useValue: { hasPermission: jest.fn().mockReturnValue(true) } },
            ],
        }).compile();

        controller = module.get<TasksController>(TasksController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create task', async () => {
        const req = { user: { uuid: 'user-1' } } as any;
        const result = await controller.create('proj-1', { title: 'New Task' }, req);
        expect(result).toEqual(mockTask);
        expect(service.create).toHaveBeenCalledWith('proj-1', { title: 'New Task' }, 'user-1');
    });

    it('should find all tasks in a project', async () => {
        const result = await controller.findAll('proj-1');
        expect(result).toEqual([mockTask]);
        expect(service.findAll).toHaveBeenCalledWith('proj-1');
    });

    it('should move task in Kanban board', async () => {
        const result = await controller.move('task-123', { statusUuid: 'stat-2', orderIndex: 1 });
        expect(result).toEqual(mockTask);
        expect(service.move).toHaveBeenCalledWith('task-123', { statusUuid: 'stat-2', orderIndex: 1 });
    });
});
