import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskTimeLogsService } from '@moduleProjects/services/task-time-logs.service';
import { TaskTimeLog } from '@moduleProjects/entities/task-time-log.entity';
import { Task } from '@moduleProjects/entities/task.entity';
import { User } from '@moduleUsers/entities/user.entity';

describe('TaskTimeLogsService', () => {
    let service: TaskTimeLogsService;
    let timeLogRepo: any;
    let taskRepo: any;
    let userRepo: any;

    const mockTask = { id: 1, uuid: 'task-123' };
    const mockUser = { id: 10, uuid: 'user-1' };
    const mockLog = { id: 100, uuid: 'log-1', minutes: 120, taskUuid: 'task-123' };

    beforeEach(async () => {
        timeLogRepo = {
            create: jest.fn().mockImplementation((d) => d),
            save: jest.fn().mockImplementation(async (d) => ({ id: 100, uuid: 'log-1', ...d })),
            find: jest.fn().mockResolvedValue([mockLog]),
            findOne: jest.fn().mockResolvedValue(mockLog),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        taskRepo = { findOne: jest.fn().mockResolvedValue(mockTask) };
        userRepo = { findOne: jest.fn().mockResolvedValue(mockUser) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskTimeLogsService,
                { provide: getRepositoryToken(TaskTimeLog), useValue: timeLogRepo },
                { provide: getRepositoryToken(Task), useValue: taskRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();

        service = module.get<TaskTimeLogsService>(TaskTimeLogsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create time log for task', async () => {
        const result = await service.create(
            'task-123',
            { minutes: 90, description: 'Code review' },
            'user-1',
        );
        expect(result).toBeDefined();
        expect(timeLogRepo.save).toHaveBeenCalled();
    });

    it('should return time logs for task', async () => {
        const result = await service.findAll('task-123');
        expect(result).toEqual([mockLog]);
    });

    it('should delete time log', async () => {
        await service.delete('task-123', 'log-1');
        expect(timeLogRepo.remove).toHaveBeenCalled();
    });
});
