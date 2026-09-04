import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from './workspace.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Workspace } from '../entities/workspace.entity';
import { NotFoundException } from '@nestjs/common';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let repository: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    };

    repository = {
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a workspace', async () => {
      const createDto = { name: 'Test WS', description: 'Test', isPrivate: false };
      const userUUID = 'u-1';
      
      const expectedCreated = { ...createDto, createdByUUID: userUUID };
      repository.create.mockReturnValue(expectedCreated);
      repository.save.mockResolvedValue({ id: 1, ...expectedCreated });

      const result = await service.create(createDto, userUUID);
      expect(repository.create).toHaveBeenCalledWith(expectedCreated);
      expect(repository.save).toHaveBeenCalledWith(expectedCreated);
      expect(result).toEqual({ id: 1, ...expectedCreated });
    });
  });

  describe('findAll', () => {
    it('should query workspaces using queryBuilder', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll({});
      expect(result).toEqual([{ id: 1 }]);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('workspace');
    });

    it('should include relations if provided', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }]);
      await service.findAll({ relations: ['owner'] });
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('workspace.owner', 'owner');
    });

    it('should apply filters if provided', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }]);
      await service.findAll({ filters: [{ field: 'name', operator: 'eq', value: 'Test' }] });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a workspace if found', async () => {
      const mockWorkspace = { uuid: 'ws-1' };
      mockQueryBuilder.getOne.mockResolvedValue(mockWorkspace);

      const result = await service.findOne('ws-1');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('workspace.uuid = :uuid', { uuid: 'ws-1' });
      expect(result).toEqual(mockWorkspace);
    });

    it('should throw NotFoundException if not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      await expect(service.findOne('ws-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save a workspace', async () => {
      const existingWorkspace = { uuid: 'ws-1', name: 'Old' };
      const updateDto = { name: 'New' };

      mockQueryBuilder.getOne.mockResolvedValue(existingWorkspace);
      repository.save.mockResolvedValue({ ...existingWorkspace, ...updateDto });

      const result = await service.update('ws-1', updateDto);
      expect(repository.merge).toHaveBeenCalledWith(existingWorkspace, updateDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe('New');
    });
  });

  describe('remove', () => {
    it('should remove a workspace', async () => {
      const existingWorkspace = { uuid: 'ws-1' };
      mockQueryBuilder.getOne.mockResolvedValue(existingWorkspace);
      
      await service.remove('ws-1');
      expect(repository.remove).toHaveBeenCalledWith(existingWorkspace);
    });
  });
});
