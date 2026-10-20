import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { UserType } from '../enums/users.enum';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
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

  it('create should call service.create', async () => {
    const dto = { rubberHandle: 'test', username: 'Test', type: UserType.INTERNAL, password: 'pwd' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
