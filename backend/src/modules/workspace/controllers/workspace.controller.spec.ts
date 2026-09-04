jest.mock('@nestjs/mapped-types', () => ({
  PartialType: jest.fn().mockImplementation(() => class {}),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from '../services/workspace.service';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;
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
      controllers: [WorkspaceController],
      providers: [
        { provide: WorkspaceService, useValue: service },
      ],
    })
    .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
    .overrideGuard(AuthGuard('jwt')).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create with userUUID', async () => {
    const dto = { name: 'Test', isPrivate: false };
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
    const dto = { name: 'New' };
    await controller.update('uuid-1', dto);
    expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
  });

  it('remove should call service.remove', async () => {
    await controller.remove('uuid-1');
    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});
