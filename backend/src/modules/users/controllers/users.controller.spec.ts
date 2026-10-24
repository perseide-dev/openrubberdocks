import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '@moduleUsers/controllers/users.controller';
import { UsersService } from '@moduleUsers/services/users.service';
import { UserType } from '@moduleUsers/enums/users.enum';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
        {
          provide: AccessControlService,
          useValue: { hasPermission: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service.findAll', async () => {
    await controller.findAll('search-term');
    expect(service.findAll).toHaveBeenCalledWith('search-term');
  });

  it('create should call service.create', async () => {
    const dto = { rubberHandle: 'test', username: 'Test', type: UserType.INTERNAL, password: 'pwd' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update should call service.update', async () => {
    const dto = { username: 'Updated Name' };
    await controller.update('user-uuid-1', dto);
    expect(service.update).toHaveBeenCalledWith('user-uuid-1', dto);
  });
});
