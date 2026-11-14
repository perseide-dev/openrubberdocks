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

    it('should sync all 6 rich technical block types (image, file_attachment, table, callout, mermaid, openapi_spec, internal_link)', async () => {
      fileRepo.findOne.mockResolvedValue({ id: 7, uuid: 'p-1' });
      blockRepo.delete = jest.fn().mockResolvedValue({});
      blockRepo.create.mockImplementation((item: any) => item);
      blockRepo.save.mockImplementation(async (items: any) => items);

      const richBlocks = [
        {
          type: BlockType.IMAGE,
          properties: { text: '/storage/attachments/att-1/content', attachment: { attachmentUuid: 'att-1' } },
          orderIndex: 0,
        },
        {
          type: BlockType.FILE_ATTACHMENT,
          properties: { text: '/storage/attachments/att-2/content', attachment: { originalName: 'logs.tar.gz' } },
          orderIndex: 1,
        },
        {
          type: BlockType.TABLE,
          properties: { text: '| A | B |\n| --- | --- |\n| 1 | 2 |', table: { headers: ['A', 'B'], rows: [['1', '2']] } },
          orderIndex: 2,
        },
        {
          type: BlockType.CALLOUT,
          properties: { text: 'Strict RBAC enforced', calloutVariant: 'DANGER' },
          orderIndex: 3,
        },
        {
          type: BlockType.MERMAID,
          properties: { text: 'flowchart LR\n  A --> B' },
          orderIndex: 4,
        },
        {
          type: BlockType.OPENAPI_SPEC,
          properties: { text: 'openapi: 3.0.3\ninfo:\n  title: API\n  version: 1.0.0' },
          orderIndex: 5,
        },
        {
          type: BlockType.INTERNAL_LINK,
          properties: {
            text: 'Architecture Spec',
            internalLink: { targetType: 'document', targetUuid: 'doc-uuid-1', targetTitle: 'Architecture Spec' },
          },
          orderIndex: 6,
        },
      ];

      const result = await service.syncFileBlocks('p-1', { blocks: richBlocks }, 'u-1');
      expect(result).toHaveLength(7);
      expect(result.map((b: any) => b.type)).toEqual([
        BlockType.IMAGE,
        BlockType.FILE_ATTACHMENT,
        BlockType.TABLE,
        BlockType.CALLOUT,
        BlockType.MERMAID,
        BlockType.OPENAPI_SPEC,
        BlockType.INTERNAL_LINK,
      ]);
    });
  });
});
