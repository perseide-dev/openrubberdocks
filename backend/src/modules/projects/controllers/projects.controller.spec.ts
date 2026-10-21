import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from '@moduleProjects/controllers/projects.controller';
import { ProjectsService } from '@moduleProjects/services/projects.service';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

describe('ProjectsController', () => {
    let controller: ProjectsController;
    let service: any;

    const mockProject = { id: 1, uuid: 'proj-123', name: 'Test Project' };

    beforeEach(async () => {
        service = {
            create: jest.fn().mockResolvedValue(mockProject),
            findAll: jest.fn().mockResolvedValue([mockProject]),
            findOne: jest.fn().mockResolvedValue(mockProject),
            update: jest.fn().mockResolvedValue(mockProject),
            delete: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectsController],
            providers: [
                { provide: ProjectsService, useValue: service },
                { provide: AccessControlService, useValue: { hasPermission: jest.fn().mockReturnValue(true) } },
            ],
        }).compile();

        controller = module.get<ProjectsController>(ProjectsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create project', async () => {
        const req = { user: { uuid: 'user-1' } } as any;
        const result = await controller.create({ name: 'New Project', workspaceUuid: 'ws-1' }, req);
        expect(result).toEqual(mockProject);
        expect(service.create).toHaveBeenCalledWith(
            { name: 'New Project', workspaceUuid: 'ws-1' },
            'user-1',
        );
    });

    it('should find all projects for a workspace', async () => {
        const result = await controller.findAll('ws-1');
        expect(result).toEqual([mockProject]);
        expect(service.findAll).toHaveBeenCalledWith('ws-1');
    });

    it('should find one project', async () => {
        const result = await controller.findOne('proj-123');
        expect(result).toEqual(mockProject);
    });

    it('should update project', async () => {
        const result = await controller.update('proj-123', { name: 'Updated' });
        expect(result).toEqual(mockProject);
    });

    it('should remove project', async () => {
        await controller.remove('proj-123');
        expect(service.delete).toHaveBeenCalledWith('proj-123');
    });
});
