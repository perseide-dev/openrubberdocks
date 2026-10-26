import { Test, TestingModule } from '@nestjs/testing';
import { BlocksService } from '@moduleFiles/blocks/services/blocks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { BlockRevision } from '@moduleFiles/blocks/entities/block-revision.entity';
import { NotFoundException } from '@nestjs/common';
import { BlockType } from '@moduleFiles/blocks/enums/block-type.enum';
import { File } from '@moduleFiles/manager/entities/file.entity';

describe('BlocksService', () => {
  let service: BlocksService;
  let blockRepo: any;
  let blockRevisionRepo: any;
  let fileRepo: any;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    };

    blockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    blockRevisionRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    fileRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlocksService,
        {
          provide: getRepositoryToken(Block),
          useValue: blockRepo,
        },
        {
          provide: getRepositoryToken(BlockRevision),
          useValue: blockRevisionRepo,
        },
        {
          provide: getRepositoryToken(File),
          useValue: fileRepo,
        },
      ],
    }).compile();

    service = module.get<BlocksService>(BlocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create block and revision', async () => {
      const createDto = { fileUuid: 'p-1', type: BlockType.TEXT, properties: {}, orderIndex: 1 } as any;
      const userUUID = 'u-1';
      
      fileRepo.findOne.mockResolvedValue({ id: 7, uuid: 'p-1' });
      const expectedBlockCreate = { ...createDto, fileId: 7, createdByUuid: userUUID };
      const savedBlock = { uuid: 'b-1', properties: {}, ...expectedBlockCreate };

      blockRepo.create.mockReturnValue(expectedBlockCreate);
      blockRepo.save.mockResolvedValue(savedBlock);

      const expectedRevisionCreate = { blockUuid: 'b-1', properties: {}, createdByUuid: userUUID };
      blockRevisionRepo.create.mockReturnValue(expectedRevisionCreate);
      blockRevisionRepo.save.mockResolvedValue({ id: 1 });

      const result = await service.create(createDto, userUUID);
      
      expect(blockRepo.create).toHaveBeenCalledWith(expectedBlockCreate);
      expect(blockRepo.save).toHaveBeenCalledWith(expectedBlockCreate);
      expect(blockRevisionRepo.create).toHaveBeenCalledWith(expectedRevisionCreate);
      expect(blockRevisionRepo.save).toHaveBeenCalled();
      expect(result).toEqual(savedBlock);
    });
  });

  describe('findAll', () => {
    it('should query blocks and order them', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }]);
      const result = await service.findAll({});
      expect(result).toEqual([{ id: 1 }]);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('block.orderIndex', 'ASC');
    });

    it('should apply filters and relations', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([{ id: 1 }]);
      await service.findAll({ relations: ['file'], filters: [{ field: 'type', operator: 'eq', value: 'paragraph' }] as any });
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('block.file', 'file');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a block if found', async () => {
      const mockBlock = { uuid: 'b-1' };
      mockQueryBuilder.getOne.mockResolvedValue(mockBlock);

      const result = await service.findOne('b-1');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('block.uuid = :uuid', { uuid: 'b-1' });
      expect(result).toEqual(mockBlock);
    });

    it('should throw NotFoundException if not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      await expect(service.findOne('b-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update block and create revision', async () => {
      const existingBlock = { uuid: 'b-1', properties: { text: 'Old' } };
      const updateDto = { properties: { text: 'New' } };
      const userUUID = 'u-1';

      mockQueryBuilder.getOne.mockResolvedValue(existingBlock);
      const savedBlock = { ...existingBlock, ...updateDto };
      blockRepo.save.mockResolvedValue(savedBlock);

      blockRevisionRepo.create.mockReturnValue({ blockUuid: 'b-1', properties: savedBlock.properties, createdByUuid: userUUID });
      
      const result = await service.update('b-1', updateDto, userUUID);
      
      expect(blockRepo.merge).toHaveBeenCalledWith(existingBlock, updateDto);
      expect(blockRepo.save).toHaveBeenCalled();
      expect(blockRevisionRepo.create).toHaveBeenCalled();
      expect(blockRevisionRepo.save).toHaveBeenCalled();
      expect(result.properties).toEqual({ text: 'New' });
    });
  });

  describe('move', () => {
    it('should update orderIndex and optionally parentBlockUuid', async () => {
      const existingBlock = { uuid: 'b-1', orderIndex: 1 };
      mockQueryBuilder.getOne.mockResolvedValue(existingBlock);
      blockRepo.save.mockResolvedValue({ ...existingBlock, orderIndex: 2, parentBlockUuid: 'parent-1' });

      const result = await service.move('b-1', { newOrderIndex: 2, newParentBlockUuid: 'parent-1' });
      
      expect(existingBlock.orderIndex).toBe(2);
      expect((existingBlock as any).parentBlockUuid).toBe('parent-1');
      expect(blockRepo.save).toHaveBeenCalledWith(existingBlock);
      expect(result.orderIndex).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove a block', async () => {
      const existingBlock = { uuid: 'b-1' };
      mockQueryBuilder.getOne.mockResolvedValue(existingBlock);
      
      await service.remove('b-1');
      expect(blockRepo.remove).toHaveBeenCalledWith(existingBlock);
    });
  });

  describe('syncFileBlocks', () => {
    it('should replace all blocks for a file', async () => {
      fileRepo.findOne.mockResolvedValue({ id: 7, uuid: 'p-1' });
      blockRepo.delete = jest.fn().mockResolvedValue({});
      blockRepo.create.mockImplementation((item: any) => item);
      blockRepo.save.mockImplementation(async (items: any) => items);

      const result = await service.syncFileBlocks(
        'p-1',
        {
          blocks: [
            { type: BlockType.HEADING_1, properties: { text: 'Title' }, orderIndex: 0 },
            { type: BlockType.TEXT, properties: { text: 'Body' }, orderIndex: 1 },
          ],
        },
        'u-1',
      );

      expect(blockRepo.delete).toHaveBeenCalledWith({ fileId: 7 });
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(BlockType.HEADING_1);
    });
  });
});
