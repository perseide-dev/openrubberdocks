import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskConfigurationService } from '@moduleProjects/services/task-configuration.service';
import { Project } from '@moduleProjects/entities/project.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';
import { TaskPropertyDefinition } from '@moduleProjects/entities/task-property-definition.entity';
import { ProjectFileLink } from '@moduleProjects/entities/project-file-link.entity';
import { File } from '@moduleFiles/manager/entities/file.entity';

describe('TaskConfigurationService', () => {
    let service: TaskConfigurationService;
    let projectRepo: any;
    let statusRepo: any;
    let typeRepo: any;
    let propRepo: any;
    let linkRepo: any;
    let fileRepo: any;

    const mockProject = { id: 1, uuid: 'proj-123' };
    const mockStatus = { id: 10, uuid: 'stat-1', name: 'In Review' };
    const mockType = { id: 20, uuid: 'type-1', name: 'Bug' };
    const mockProp = { id: 30, uuid: 'prop-1', name: 'Priority', type: 'select' };
    const mockFile = { id: 40, uuid: 'file-1' };
    const mockLink = { id: 50, uuid: 'link-1', projectId: 1, fileId: 40 };

    beforeEach(async () => {
        projectRepo = { findOne: jest.fn().mockResolvedValue(mockProject) };
        statusRepo = {
            find: jest.fn().mockResolvedValue([mockStatus]),
            findOne: jest.fn().mockResolvedValue(mockStatus),
            create: jest.fn().mockImplementation((d) => d),
            save: jest.fn().mockImplementation(async (d) => ({ id: 10, uuid: 'stat-1', ...d })),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        typeRepo = {
            find: jest.fn().mockResolvedValue([mockType]),
            findOne: jest.fn().mockResolvedValue(mockType),
            create: jest.fn().mockImplementation((d) => d),
            save: jest.fn().mockImplementation(async (d) => ({ id: 20, uuid: 'type-1', ...d })),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        propRepo = {
            find: jest.fn().mockResolvedValue([mockProp]),
            findOne: jest.fn().mockResolvedValue(mockProp),
            create: jest.fn().mockImplementation((d) => d),
            save: jest.fn().mockImplementation(async (d) => ({ id: 30, uuid: 'prop-1', ...d })),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        linkRepo = {
            find: jest.fn().mockResolvedValue([mockLink]),
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((d) => d),
            save: jest.fn().mockImplementation(async (d) => ({ id: 50, uuid: 'link-1', ...d })),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        fileRepo = { findOne: jest.fn().mockResolvedValue(mockFile) };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskConfigurationService,
                { provide: getRepositoryToken(Project), useValue: projectRepo },
                { provide: getRepositoryToken(TaskStatus), useValue: statusRepo },
                { provide: getRepositoryToken(TaskType), useValue: typeRepo },
                { provide: getRepositoryToken(TaskPropertyDefinition), useValue: propRepo },
                { provide: getRepositoryToken(ProjectFileLink), useValue: linkRepo },
                { provide: getRepositoryToken(File), useValue: fileRepo },
            ],
        }).compile();

        service = module.get<TaskConfigurationService>(TaskConfigurationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create custom status column', async () => {
        const result = await service.createStatus('proj-123', { name: 'QA', category: 'IN_PROGRESS' });
        expect(result).toBeDefined();
        expect(statusRepo.save).toHaveBeenCalled();
    });

    it('should create custom task type', async () => {
        const result = await service.createType('proj-123', { name: 'Investigation', icon: 'search' });
        expect(result).toBeDefined();
        expect(typeRepo.save).toHaveBeenCalled();
    });

    it('should create custom Notion-like property definition', async () => {
        const result = await service.createProperty('proj-123', {
            name: 'Client',
            type: 'text',
        });
        expect(result).toBeDefined();
        expect(propRepo.save).toHaveBeenCalled();
    });

    it('should link file to project', async () => {
        const result = await service.linkFile('proj-123', 'file-1');
        expect(result).toBeDefined();
        expect(linkRepo.save).toHaveBeenCalled();
    });
});
