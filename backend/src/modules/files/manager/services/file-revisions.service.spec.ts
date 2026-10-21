import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FileRevisionsService } from '@moduleFiles/manager/services/file-revisions.service';
import { FileRevision } from '@moduleFiles/manager/entities/file-revision.entity';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { User } from '@moduleUsers/entities/user.entity';

describe('FileRevisionsService', () => {
  let service: FileRevisionsService;
  let fileRevisionRepo: any;
  let fileRepo: any;
  let blockRepo: any;
  let userRepo: any;

  const mockFile = { id: 1, uuid: 'file-123', title: 'Test Document' };
  const mockUser = { id: 2, uuid: 'user-456', rubberHandle: 'test_user' };
  const mockBlocks = [
    { id: 10, uuid: 'b-1', type: 'text', orderIndex: 0, properties: { text: 'Hello' } },
  ];
  const mockRevision = {
    id: 100,
    uuid: 'rev-789',
    fileId: 1,
    fileUuid: 'file-123',
    title: 'Test Document',
    blocksSnapshot: [
      { uuid: 'b-1', type: 'text', orderIndex: 0, properties: { text: 'Hello' } },
    ],
    createdBy: mockUser,
    createdById: 2,
    createdByUuid: 'user-456',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    fileRevisionRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation(async (item) => ({ id: 100, uuid: 'rev-789', ...item })),
      find: jest.fn().mockResolvedValue([mockRevision]),
      findOne: jest.fn().mockResolvedValue(mockRevision),
    };

    fileRepo = {
      findOne: jest.fn().mockResolvedValue(mockFile),
      findOneOrFail: jest.fn().mockResolvedValue(mockFile),
      save: jest.fn().mockResolvedValue(mockFile),
    };

    blockRepo = {
      find: jest.fn().mockResolvedValue(mockBlocks),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockResolvedValue(mockBlocks),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    userRepo = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileRevisionsService,
        { provide: getRepositoryToken(FileRevision), useValue: fileRevisionRepo },
        { provide: getRepositoryToken(File), useValue: fileRepo },
        { provide: getRepositoryToken(Block), useValue: blockRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<FileRevisionsService>(FileRevisionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSnapshot', () => {
    it('should create and save a new file revision snapshot', async () => {
      const result = await service.createSnapshot('file-123', 'user-456');

      expect(fileRepo.findOne).toHaveBeenCalledWith({ where: { uuid: 'file-123' } });
      expect(blockRepo.find).toHaveBeenCalledWith({
        where: { fileId: mockFile.id },
        order: { orderIndex: 'ASC' },
      });
      expect(fileRevisionRepo.create).toHaveBeenCalled();
      expect(fileRevisionRepo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('blocksSnapshot');
    });

    it('should throw NotFoundException if file does not exist', async () => {
      fileRepo.findOne.mockResolvedValue(null);

      await expect(service.createSnapshot('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllRevisions', () => {
    it('should return all revisions for a file', async () => {
      const result = await service.findAllRevisions('file-123');

      expect(fileRevisionRepo.find).toHaveBeenCalledWith({
        where: { fileUuid: 'file-123' },
        relations: ['createdBy'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockRevision]);
    });
  });

  describe('findOneRevision', () => {
    it('should return a specific revision', async () => {
      const result = await service.findOneRevision('file-123', 'rev-789');

      expect(fileRevisionRepo.findOne).toHaveBeenCalledWith({
        where: { uuid: 'rev-789', fileUuid: 'file-123' },
        relations: ['createdBy'],
      });
      expect(result).toEqual(mockRevision);
    });

    it('should throw NotFoundException if revision does not exist', async () => {
      fileRevisionRepo.findOne.mockResolvedValue(null);

      await expect(service.findOneRevision('file-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restoreRevision', () => {
    it('should restore blocks from snapshot and save a new revision audit record', async () => {
      const result = await service.restoreRevision('file-123', 'rev-789', 'user-456');

      expect(blockRepo.delete).toHaveBeenCalledWith({ fileId: mockFile.id });
      expect(blockRepo.create).toHaveBeenCalled();
      expect(blockRepo.save).toHaveBeenCalled();
      expect(fileRevisionRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockFile);
    });
  });
});
