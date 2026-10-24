import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@moduleUsers/services/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@moduleUsers/entities/user.entity';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserType } from '@moduleUsers/enums/users.enum';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;
  let roleRepo: any;
  let scopeRepo: any;

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    roleRepo = {
      findOne: jest.fn(),
    };
    scopeRepo = {
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepo,
        },
        {
          provide: getRepositoryToken(UserRoleScope),
          useValue: scopeRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createDto = { rubberHandle: 'test', username: 'Test', type: UserType.INTERNAL, password: 'pwd' };
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createDto);
      repository.save.mockResolvedValue(createDto);

      const result = await service.create(createDto);
      expect(result).toEqual(createDto);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createDto = { rubberHandle: 'test', username: 'Test', type: UserType.INTERNAL, password: 'pwd' };
      repository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if core admin already exists', async () => {
      const createDto = { rubberHandle: 'test', username: 'Test', type: UserType.COREADMIN, password: 'pwd' };
      // first call checks for existing user (mock to null)
      // second call checks for existing core admin (mock to existing)
      repository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if initialRoleUuid does not exist', async () => {
      const createDto = {
        rubberHandle: 'test',
        username: 'Test',
        type: UserType.INTERNAL,
        password: 'pwd',
        initialRoleUuid: 'non-existent-role-uuid',
      };
      repository.findOne.mockResolvedValue(null);
      roleRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if assigning Super Admin role to non-core user', async () => {
      const createDto = {
        rubberHandle: 'test',
        username: 'Test',
        type: UserType.INTERNAL,
        password: 'pwd',
        initialRoleUuid: 'super-admin-role-uuid',
      };
      repository.findOne.mockResolvedValue(null);
      roleRepo.findOne.mockResolvedValue({ uuid: 'super-admin-role-uuid', name: 'Super Admin', isAssignable: false });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should assign role scope if valid initialRoleUuid provided', async () => {
      const createDto = {
        rubberHandle: 'test',
        username: 'Test',
        type: UserType.INTERNAL,
        password: 'pwd',
        initialRoleUuid: 'editor-role-uuid',
      };
      const mockRole = { uuid: 'editor-role-uuid', name: 'Editor', isAssignable: true };
      const savedUser = { id: 1, ...createDto };
      repository.findOne.mockResolvedValue(null);
      roleRepo.findOne.mockResolvedValue(mockRole);
      repository.create.mockReturnValue(savedUser);
      repository.save.mockResolvedValue(savedUser);
      scopeRepo.create.mockReturnValue({});
      scopeRepo.save.mockResolvedValue({});

      const result = await service.create(createDto);
      expect(result).toEqual(savedUser);
      expect(scopeRepo.create).toHaveBeenCalledWith({ user: savedUser, role: mockRole });
      expect(scopeRepo.save).toHaveBeenCalled();
    });
  });

  describe('findByRubberHandle', () => {
    it('should return a user if found', async () => {
      const mockUser = { rubberHandle: 'test' };
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByRubberHandle('test');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByRubberHandle('test')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { uuid: 'u-1' };
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('u-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('u-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      await service.updateRefreshToken('u-1', 'new-token');
      expect(repository.update).toHaveBeenCalledWith({ uuid: 'u-1' }, { hashedRefreshToken: 'new-token' });
    });
  });

  describe('findAll', () => {
    it('should search users stripping @ prefix', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1, rubberHandle: 'admin' }]),
      };
      repository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll('@admin');
      expect(qb.where).toHaveBeenCalledWith(
        'LOWER(user.rubberHandle) LIKE :term OR LOWER(user.username) LIKE :term',
        { term: '%admin%' },
      );
      expect(result).toEqual([{ id: 1, rubberHandle: 'admin' }]);
    });
  });

  describe('update', () => {
    const existingUser = {
      id: 1,
      uuid: 'user-uuid-1',
      rubberHandle: 'existing',
      username: 'Existing User',
      type: UserType.INTERNAL,
      scopes: [],
    };

    it('should throw NotFoundException if user to update does not exist', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.update('non-existent', { username: 'New' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if rubberHandle is taken by another user', async () => {
      repository.findOne
        .mockResolvedValueOnce({ ...existingUser })
        .mockResolvedValueOnce({ id: 2, uuid: 'user-uuid-2', rubberHandle: 'taken' });

      await expect(service.update('user-uuid-1', { rubberHandle: 'taken' })).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if trying to modify Core Admin type', async () => {
      repository.findOne.mockResolvedValueOnce({
        ...existingUser,
        type: UserType.COREADMIN,
      });

      await expect(
        service.update('user-uuid-1', { type: UserType.INTERNAL }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trying to promote user to Core Admin', async () => {
      repository.findOne.mockResolvedValueOnce({ ...existingUser });

      await expect(
        service.update('user-uuid-1', { type: UserType.COREADMIN }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trying to modify Core Admin role scope', async () => {
      repository.findOne.mockResolvedValueOnce({
        ...existingUser,
        type: UserType.COREADMIN,
      });

      await expect(
        service.update('user-uuid-1', { globalRoleUuid: 'role-uuid' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trying to assign global role to external user', async () => {
      repository.findOne.mockResolvedValueOnce({
        ...existingUser,
        type: UserType.EXTERNAL,
      });

      await expect(
        service.update('user-uuid-1', { globalRoleUuid: 'role-uuid' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if assigned role does not exist', async () => {
      repository.findOne.mockResolvedValueOnce({ ...existingUser });
      roleRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update('user-uuid-1', { globalRoleUuid: 'non-existent-role' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if assigned role is unassignable (Super Admin)', async () => {
      repository.findOne.mockResolvedValueOnce({ ...existingUser });
      roleRepo.findOne.mockResolvedValueOnce({ uuid: 'r-super', name: 'Super Admin', isAssignable: false });

      await expect(
        service.update('user-uuid-1', { globalRoleUuid: 'r-super' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update user fields and assign global role when scope does not exist', async () => {
      const mockRole = { uuid: 'r-editor', name: 'Editor', isAssignable: true };
      const userInstance = { ...existingUser, scopes: [] };
      const savedUser = { ...userInstance, username: 'Updated User', rubberHandle: 'newhandle' };

      repository.findOne
        .mockResolvedValueOnce(userInstance) // first find for update
        .mockResolvedValueOnce(null) // no handle conflict
        .mockResolvedValueOnce(savedUser); // findById after save
      roleRepo.findOne.mockResolvedValueOnce(mockRole);
      repository.save.mockResolvedValueOnce(savedUser);
      scopeRepo.create.mockReturnValueOnce({ user: userInstance, role: mockRole });
      scopeRepo.save.mockResolvedValueOnce({});

      const result = await service.update('user-uuid-1', {
        username: 'Updated User',
        rubberHandle: 'newhandle',
        globalRoleUuid: 'r-editor',
      });

      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        username: 'Updated User',
        rubberHandle: 'newhandle',
      }));
      expect(scopeRepo.create).toHaveBeenCalledWith({ user: expect.any(Object), role: mockRole });
      expect(result).toEqual(savedUser);
    });

    it('should update existing global scope role', async () => {
      const mockRole = { uuid: 'r-editor', name: 'Editor', isAssignable: true };
      const existingScope = { id: 10, role: { uuid: 'r-old' }, workspace: null };
      const userInstance = { ...existingUser, scopes: [existingScope] };

      repository.findOne
        .mockResolvedValueOnce(userInstance)
        .mockResolvedValueOnce(userInstance);
      roleRepo.findOne.mockResolvedValueOnce(mockRole);
      repository.save.mockResolvedValueOnce(userInstance);
      scopeRepo.save.mockResolvedValueOnce({});

      await service.update('user-uuid-1', { globalRoleUuid: 'r-editor' });

      expect(existingScope.role).toEqual(mockRole);
      expect(scopeRepo.save).toHaveBeenCalledWith(existingScope);
    });

    it('should remove existing global scope if globalRoleUuid is null', async () => {
      const existingScope = { id: 10, role: { uuid: 'r-old' }, workspace: null };
      const userInstance = { ...existingUser, scopes: [existingScope] };

      repository.findOne
        .mockResolvedValueOnce(userInstance)
        .mockResolvedValueOnce(userInstance);
      repository.save.mockResolvedValueOnce(userInstance);
      scopeRepo.remove.mockResolvedValueOnce({});

      await service.update('user-uuid-1', { globalRoleUuid: null });

      expect(scopeRepo.remove).toHaveBeenCalledWith(existingScope);
    });

    it('should auto-remove existing global scope if user type is changed to external', async () => {
      const existingScope = { id: 10, role: { uuid: 'r-old' }, workspace: null };
      const userInstance = { ...existingUser, scopes: [existingScope] };

      repository.findOne
        .mockResolvedValueOnce(userInstance)
        .mockResolvedValueOnce(userInstance);
      repository.save.mockResolvedValueOnce(userInstance);
      scopeRepo.remove.mockResolvedValueOnce({});

      await service.update('user-uuid-1', { type: UserType.EXTERNAL });

      expect(scopeRepo.remove).toHaveBeenCalledWith(existingScope);
      expect(userInstance.type).toEqual(UserType.EXTERNAL);
    });
  });
});
