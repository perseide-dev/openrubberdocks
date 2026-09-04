import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationController } from './authorization.controller';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';
import { RoleManagementService } from '../services/role-management.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignRoleScopeDto } from '../dto/assign-role-scope.dto';

describe('AuthorizationController', () => {
  let controller: AuthorizationController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      assignScope: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizationController],
      providers: [
        { provide: RoleManagementService, useValue: service },
      ],
    })
    .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
    .overrideGuard(AuthGuard('jwt')).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthorizationController>(AuthorizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllRoles should call service.findAll', async () => {
    const mockQuery = { relations: [] };
    await controller.findAllRoles(mockQuery);
    expect(service.findAll).toHaveBeenCalledWith(mockQuery);
  });

  it('findOneRole should call service.findOne', async () => {
    const mockQuery = { relations: [] };
    await controller.findOneRole('uuid-123', mockQuery);
    expect(service.findOne).toHaveBeenCalledWith('uuid-123', mockQuery);
  });

  it('createRole should call service.create', async () => {
    const dto: CreateRoleDto = { name: 'Test', description: 'Test' };
    await controller.createRole(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('updateRole should call service.update', async () => {
    const dto: UpdateRoleDto = { name: 'Updated' };
    await controller.updateRole('uuid-123', dto);
    expect(service.update).toHaveBeenCalledWith('uuid-123', dto);
  });

  it('removeRole should call service.remove', async () => {
    await controller.removeRole('uuid-123');
    expect(service.remove).toHaveBeenCalledWith('uuid-123');
  });

  it('assignScope should call service.assignScope', async () => {
    const dto: AssignRoleScopeDto = { userUuid: 'u-1', roleUuid: 'r-1' };
    await controller.assignScope(dto);
    expect(service.assignScope).toHaveBeenCalledWith(dto);
  });
});
