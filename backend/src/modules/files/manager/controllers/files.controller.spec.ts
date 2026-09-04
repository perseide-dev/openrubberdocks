import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from '../services/files.service';
import { AuthGuard } from '@nestjs/passport';

describe('FilesController', () => {
  let controller: FilesController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: FilesService, useValue: service },
      ],
    })
    .overrideGuard(AuthGuard('jwt')).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create with userUUID', async () => {
    const dto = { workspaceUuid: 'ws-1', title: 'Test', isPublished: false };
    const req = { user: { uuid: 'u-1' } } as any;
    
    await controller.create(dto, req);
    expect(service.create).toHaveBeenCalledWith(dto, 'u-1');
  });

  it('findAll should call service.findAll', async () => {
    await controller.findAll({});
    expect(service.findAll).toHaveBeenCalledWith({});
  });

  it('findOne should call service.findOne', async () => {
    await controller.findOne('uuid-1', {});
    expect(service.findOne).toHaveBeenCalledWith('uuid-1', {});
  });

  it('update should call service.update', async () => {
    const dto = { title: 'New' };
    await controller.update('uuid-1', dto);
    expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
  });

  it('remove should call service.remove', async () => {
    await controller.remove('uuid-1');
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
