import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
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
    };
    roleRepo = {
      findOne: jest.fn(),
    };
    scopeRepo = {
      create: jest.fn(),
      save: jest.fn(),
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
});
