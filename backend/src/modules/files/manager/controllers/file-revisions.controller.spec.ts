import { Test, TestingModule } from '@nestjs/testing';
import { FileRevisionsController } from '@moduleFiles/manager/controllers/file-revisions.controller';
import { FileRevisionsService } from '@moduleFiles/manager/services/file-revisions.service';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

describe('FileRevisionsController', () => {
  let controller: FileRevisionsController;
  let service: any;

  const mockRevision = {
    uuid: 'rev-1',
    fileUuid: 'file-1',
    title: 'Doc Title',
    blocksSnapshot: [],
  };

  beforeEach(async () => {
    service = {
      findAllRevisions: jest.fn().mockResolvedValue([mockRevision]),
      findOneRevision: jest.fn().mockResolvedValue(mockRevision),
      createSnapshot: jest.fn().mockResolvedValue(mockRevision),
      restoreRevision: jest.fn().mockResolvedValue({ uuid: 'file-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileRevisionsController],
      providers: [
        { provide: FileRevisionsService, useValue: service },
        { provide: AccessControlService, useValue: { hasPermission: jest.fn().mockResolvedValue(true) } },
      ],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FileRevisionsController>(FileRevisionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all revisions of a file', async () => {
      const result = await controller.findAll('file-1');
      expect(service.findAllRevisions).toHaveBeenCalledWith('file-1');
      expect(result).toEqual([mockRevision]);
    });
  });

  describe('findOne', () => {
    it('should return a specific revision', async () => {
      const result = await controller.findOne('file-1', 'rev-1');
      expect(service.findOneRevision).toHaveBeenCalledWith('file-1', 'rev-1');
      expect(result).toEqual(mockRevision);
    });
  });

  describe('createSnapshot', () => {
    it('should trigger snapshot creation with authenticated user uuid', async () => {
      const mockReq = { user: { uuid: 'user-1' } } as any;
      const result = await controller.createSnapshot('file-1', mockReq);
      expect(service.createSnapshot).toHaveBeenCalledWith('file-1', 'user-1');
      expect(result).toEqual(mockRevision);
    });
  });

  describe('restore', () => {
    it('should trigger revision restore with authenticated user uuid', async () => {
      const mockReq = { user: { uuid: 'user-1' } } as any;
      const result = await controller.restore('file-1', 'rev-1', mockReq);
      expect(service.restoreRevision).toHaveBeenCalledWith('file-1', 'rev-1', 'user-1');
      expect(result).toEqual({ uuid: 'file-1' });
    });
  });
});
