import { Test, TestingModule } from '@nestjs/testing';
import { BlocksController } from './blocks.controller';
import { BlocksService } from '../services/blocks.service';
import { AuthGuard } from '@nestjs/passport';

describe('BlocksController', () => {
  let controller: BlocksController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      move: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocksController],
      providers: [
        { provide: BlocksService, useValue: service },
      ],
    })
    .overrideGuard(AuthGuard('jwt')).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<BlocksController>(BlocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create with userUUID', async () => {
    const dto = { pageUuid: 'ws-1', type: 'paragraph' as any, properties: {}, orderIndex: 1 };
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

  it('update should call service.update with userUUID', async () => {
    const dto = { properties: {} };
    const req = { user: { uuid: 'u-1' } } as any;
    
    await controller.update('uuid-1', dto, req);
    expect(service.update).toHaveBeenCalledWith('uuid-1', dto, 'u-1');
  });

  it('move should call service.move', async () => {
    const dto = { newOrderIndex: 2 };
    await controller.move('uuid-1', dto);
    expect(service.move).toHaveBeenCalledWith('uuid-1', dto);
  });

  it('remove should call service.remove', async () => {
    await controller.remove('uuid-1');
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
