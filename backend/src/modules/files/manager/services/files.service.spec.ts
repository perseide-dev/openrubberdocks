import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { File } from '../entities/file.entity';
import { NotFoundException } from '@nestjs/common';

describe('FilesService', () => {
  let service: FilesService;
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
        FilesService,
        {
          provide: getRepositoryToken(File),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a file', async () => {
      const createDto = { workspaceUuid: 'ws-1', title: 'Test', isPublished: false };
      const userUUID = 'u-1';
      
      const expectedCreated = { ...createDto, createdByUuid: userUUID };
      repository.create.mockReturnValue(expectedCreated);
      repository.save.mockResolvedValue({ id: 1, ...expectedCreated });

      const result = await service.create(createDto, userUUID);
      expect(repository.create).toHaveBeenCalledWith(expectedCreated);
      expect(repository.save).toHaveBeenCalledWith(expectedCreated);
      expect(result).toEqual({ id: 1, ...expectedCreated });
    });
  });

  describe('findAll', () => {
    it('should query files using queryBuilder', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll({});
      expect(result).toEqual([{ id: 1 }]);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('file');
    });

    it('should apply filters and relations', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }]);
      await service.findAll({ relations: ['workspace'], filters: [{ field: 'title', operator: 'eq', value: 'Test' }] });
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('file.workspace', 'workspace');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a file if found', async () => {
      const mockFile = { uuid: 'f-1' };
      mockQueryBuilder.getOne.mockResolvedValue(mockFile);

      const result = await service.findOne('f-1');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('file.uuid = :uuid', { uuid: 'f-1' });
      expect(result).toEqual(mockFile);
    });

    it('should throw NotFoundException if not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      await expect(service.findOne('f-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and save a file', async () => {
      const existingFile = { uuid: 'f-1', title: 'Old' };
      const updateDto = { title: 'New' };

      mockQueryBuilder.getOne.mockResolvedValue(existingFile);
      repository.save.mockResolvedValue({ ...existingFile, ...updateDto });

      const result = await service.update('f-1', updateDto);
      expect(repository.merge).toHaveBeenCalledWith(existingFile, updateDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('New');
    });
  });

  describe('remove', () => {
    it('should remove a file', async () => {
      const existingFile = { uuid: 'f-1' };
      mockQueryBuilder.getOne.mockResolvedValue(existingFile);
      
      await service.remove('f-1');
      expect(repository.remove).toHaveBeenCalledWith(existingFile);
    });
  });
});
