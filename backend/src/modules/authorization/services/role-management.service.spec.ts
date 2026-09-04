import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleManagementService } from './role-management.service';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { Permission } from '@moduleAuthorization/entities/permission.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AUTHORIZATION_ERRORS } from '@moduleAuthorization/constants/authorization.errors.constants';
import { UserType } from '@moduleUsers/enums/users.enum';

describe('RoleManagementService', () => {
  let service: RoleManagementService;
  let roleRepository: any;
  let permissionRepository: any;
  let scopeRepository: any;
  let userRepository: any;
  let workspaceRepository: any;

  beforeEach(async () => {
    roleRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    permissionRepository = {
      find: jest.fn(),
    };
    scopeRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
    };
    workspaceRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleManagementService,
        { provide: getRepositoryToken(Role), useValue: roleRepository },
        { provide: getRepositoryToken(Permission), useValue: permissionRepository },
        { provide: getRepositoryToken(UserRoleScope), useValue: scopeRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Workspace), useValue: workspaceRepository },
      ],
    }).compile();

    service = module.get<RoleManagementService>(RoleManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a role if found', async () => {
      const mockRole = { uuid: 'role-1' };
      roleRepository.findOne.mockResolvedValue(mockRole);

      const result = await service.findOne('role-1', { relations: [] });
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('role-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a new role', async () => {
      const createDto = { name: 'Test Role', description: 'Test', permissionUuids: ['perm-1'] };
      const mockRole = { name: 'Test Role' };
      roleRepository.create.mockReturnValue(mockRole);
      permissionRepository.find.mockResolvedValue([{ uuid: 'perm-1' }]);
      roleRepository.save.mockResolvedValue({ ...mockRole, permissions: [{ uuid: 'perm-1' }] });

      const result = await service.create(createDto);
      expect(result.permissions).toHaveLength(1);
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if some permissions are missing', async () => {
      const createDto = { name: 'Test Role', permissionUuids: ['perm-1', 'perm-2'] };
      roleRepository.create.mockReturnValue({});
      permissionRepository.find.mockResolvedValue([{ uuid: 'perm-1' }]); // One missing

      await expect(service.create(createDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if trying to modify a system defined role', async () => {
      roleRepository.findOne.mockResolvedValue({ uuid: 'sys-role', isSystemDefined: true });
      await expect(service.update('sys-role', { name: 'New Name' })).rejects.toThrow(BadRequestException);
    });

    it('should update role correctly', async () => {
      const existingRole = { uuid: 'role-1', isSystemDefined: false };
      roleRepository.findOne.mockResolvedValue(existingRole);
      roleRepository.save.mockResolvedValue({ ...existingRole, name: 'New Name' });

      const result = await service.update('role-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if trying to remove a system defined role', async () => {
      roleRepository.findOne.mockResolvedValue({ uuid: 'sys-role', isSystemDefined: true });
      await expect(service.remove('sys-role')).rejects.toThrow(BadRequestException);
    });

    it('should remove the role and return { data: null }', async () => {
      const existingRole = { uuid: 'role-1', isSystemDefined: false };
      roleRepository.findOne.mockResolvedValue(existingRole);
      
      const result = await service.remove('role-1');
      expect(roleRepository.remove).toHaveBeenCalledWith(existingRole);
      expect(result).toEqual({ data: null });
    });
  });

  describe('assignScope', () => {
    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      await expect(service.assignScope({ userUuid: 'u-1', roleUuid: 'r-1' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is coreAdmin', async () => {
      userRepository.findOne.mockResolvedValue({ type: UserType.COREADMIN });
      await expect(service.assignScope({ userUuid: 'u-1', roleUuid: 'r-1' })).rejects.toThrow(BadRequestException);
    });

    it('should assign scope successfully for internal user without workspace', async () => {
      userRepository.findOne.mockResolvedValue({ type: UserType.INTERNAL });
      roleRepository.findOne.mockResolvedValue({ uuid: 'r-1' });
      
      const mockScope = { id: 1 };
      scopeRepository.create.mockReturnValue(mockScope);
      scopeRepository.save.mockResolvedValue(mockScope);

      const result = await service.assignScope({ userUuid: 'u-1', roleUuid: 'r-1' });
      expect(result).toEqual(mockScope);
      expect(scopeRepository.create).toHaveBeenCalledWith(expect.objectContaining({ workspace: undefined }));
    });
  });
});
