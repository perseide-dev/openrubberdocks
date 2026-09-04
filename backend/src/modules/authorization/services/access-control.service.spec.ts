import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessControlService } from './access-control.service';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { UserType } from '@moduleUsers/enums/users.enum';

describe('AccessControlService', () => {
  let service: AccessControlService;
  let userRepository: any;
  let userRoleScopeRepository: any;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
    };

    userRoleScopeRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessControlService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(UserRoleScope),
          useValue: userRoleScopeRepository,
        },
      ],
    }).compile();

    service = module.get<AccessControlService>(AccessControlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return false if user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    const result = await service.hasPermission(1, 'role:read');
    expect(result).toBe(false);
  });

  it('should return true if user is COREADMIN', async () => {
    userRepository.findOne.mockResolvedValue({ id: 1, type: UserType.COREADMIN });

    const result = await service.hasPermission(1, 'role:read');
    expect(result).toBe(true);
  });

  it('should return false if user has no scopes assigned', async () => {
    userRepository.findOne.mockResolvedValue({ id: 1, type: UserType.INTERNAL });
    userRoleScopeRepository.find.mockResolvedValue([]);

    const result = await service.hasPermission(1, 'role:read');
    expect(result).toBe(false);
  });

  describe('Internal Users', () => {
    it('should return true for global scope (workspaceId null, squadId null)', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, type: UserType.INTERNAL });
      userRoleScopeRepository.find.mockResolvedValue([
        {
          workspaceId: null,
          squadId: null,
          role: { permissions: [{ action: 'role:read' }] },
        },
      ]);

      const result = await service.hasPermission(1, 'role:read');
      expect(result).toBe(true);
    });

    it('should return true if scope matches requested workspaceUuid', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, type: UserType.INTERNAL });
      userRoleScopeRepository.find.mockResolvedValue([
        {
          workspace: { uuid: 'ws-123' },
          role: { permissions: [{ action: 'workspace:read' }] },
        },
      ]);

      const result = await service.hasPermission(1, 'workspace:read', 'ws-123');
      expect(result).toBe(true);
    });

    it('should return false if scope does not match requested workspaceUuid', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, type: UserType.INTERNAL });
      userRoleScopeRepository.find.mockResolvedValue([
        {
          workspace: { uuid: 'ws-other' },
          role: { permissions: [{ action: 'workspace:read' }] },
        },
      ]);

      const result = await service.hasPermission(1, 'workspace:read', 'ws-123');
      expect(result).toBe(false);
    });
  });

  describe('External Users', () => {
    it('should return false if they try to perform write/create/edit/delete actions', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, type: UserType.EXTERNAL });
      userRoleScopeRepository.find.mockResolvedValue([
        {
          workspace: { uuid: 'ws-123' },
          role: { permissions: [{ action: 'item:write' }] },
        },
      ]);

      const result = await service.hasPermission(1, 'item:write', 'ws-123');
      expect(result).toBe(false);
    });

    it('should return true if reading and scope matches workspaceUuid', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, type: UserType.EXTERNAL });
      userRoleScopeRepository.find.mockResolvedValue([
        {
          workspace: { uuid: 'ws-123' },
          role: { permissions: [{ action: 'item:read' }] },
        },
      ]);

      const result = await service.hasPermission(1, 'item:read', 'ws-123');
      expect(result).toBe(true);
    });
  });
});
