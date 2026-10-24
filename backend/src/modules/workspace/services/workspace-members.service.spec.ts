import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { WorkspaceMember } from '@moduleWorkspace/entities/workspace-member.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { UserType } from '@moduleUsers/enums/users.enum';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';

describe('WorkspaceMembersService', () => {
  let service: WorkspaceMembersService;
  let workspaceRepo: any;
  let memberRepo: any;
  let userRepo: any;
  let roleRepo: any;
  let scopeRepo: any;

  const mockWorkspace = { id: 1, uuid: 'ws-1', name: 'Dev Workspace' };
  const mockUser = { id: 10, uuid: 'u-1', username: 'dev_user', rubberHandle: 'dev_user', type: UserType.INTERNAL };
  const mockCoreAdmin = { id: 99, uuid: 'u-admin', username: 'admin', rubberHandle: 'admin', type: UserType.COREADMIN };
  const mockRole = { id: 5, uuid: 'r-1', name: 'Workspace Editor', description: 'Can edit', isAssignable: true };

  beforeEach(async () => {
    workspaceRepo = {
      findOne: jest.fn(),
    };
    memberRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    userRepo = {
      findOne: jest.fn(),
    };
    roleRepo = {
      findOne: jest.fn(),
    };
    scopeRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceMembersService,
        { provide: getRepositoryToken(Workspace), useValue: workspaceRepo },
        { provide: getRepositoryToken(WorkspaceMember), useValue: memberRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Role), useValue: roleRepo },
        { provide: getRepositoryToken(UserRoleScope), useValue: scopeRepo },
      ],
    }).compile();

    service = module.get<WorkspaceMembersService>(WorkspaceMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMembers', () => {
    it('should return formatted members with their roles', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      memberRepo.find.mockResolvedValue([
        {
          id: 101,
          userId: mockUser.id,
          user: mockUser,
          joinedAt: new Date('2026-01-01'),
        },
      ]);
      scopeRepo.find.mockResolvedValue([
        {
          userId: mockUser.id,
          role: mockRole,
        },
      ]);

      const members = await service.findMembers('ws-1');
      expect(members).toHaveLength(1);
      expect(members[0].userUuid).toBe('u-1');
      expect(members[0].role?.name).toBe('Workspace Editor');
    });

    it('should throw NotFoundException if workspace does not exist', async () => {
      workspaceRepo.findOne.mockResolvedValue(null);
      await expect(service.findMembers('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMember', () => {
    it('should add a member and assign scope', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      userRepo.findOne.mockResolvedValue(mockUser);
      roleRepo.findOne.mockResolvedValue(mockRole);
      memberRepo.findOne.mockResolvedValue(null);

      const createdMember = { id: 201, joinedAt: new Date() };
      memberRepo.create.mockReturnValue(createdMember);
      memberRepo.save.mockResolvedValue(createdMember);
      scopeRepo.findOne.mockResolvedValue(null);
      scopeRepo.create.mockReturnValue({});
      scopeRepo.save.mockResolvedValue({});

      const result = await service.addMember('ws-1', {
        userUuid: 'u-1',
        roleUuid: 'r-1',
      });

      expect(result.userUuid).toBe('u-1');
      expect(result.role?.name).toBe('Workspace Editor');
      expect(memberRepo.save).toHaveBeenCalled();
      expect(scopeRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already a member', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      userRepo.findOne.mockResolvedValue(mockUser);
      roleRepo.findOne.mockResolvedValue(mockRole);
      memberRepo.findOne.mockResolvedValue({ id: 99 });

      await expect(
        service.addMember('ws-1', { userUuid: 'u-1', roleUuid: 'r-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if trying to assign Super Admin role', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      userRepo.findOne.mockResolvedValue(mockUser);
      roleRepo.findOne.mockResolvedValue({ id: 9, uuid: 'r-super', name: 'Super Admin', isAssignable: false });
      memberRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addMember('ws-1', { userUuid: 'u-1', roleUuid: 'r-super' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateMemberRole', () => {
    it('should update user role scope in workspace', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      userRepo.findOne.mockResolvedValue(mockUser);
      roleRepo.findOne.mockResolvedValue(mockRole);
      memberRepo.findOne.mockResolvedValue({ id: 101, joinedAt: new Date() });

      const existingScope = { role: null };
      scopeRepo.findOne.mockResolvedValue(existingScope);
      scopeRepo.save.mockResolvedValue(existingScope);

      const result = await service.updateMemberRole('ws-1', 'u-1', { roleUuid: 'r-1' });
      expect(result.role?.name).toBe('Workspace Editor');
      expect(scopeRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if trying to update member with Super Admin role', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      userRepo.findOne.mockResolvedValue(mockUser);
      roleRepo.findOne.mockResolvedValue({ id: 9, uuid: 'r-super', name: 'Super Admin', isAssignable: false });
      memberRepo.findOne.mockResolvedValue({ id: 101, joinedAt: new Date() });

      await expect(
        service.updateMemberRole('ws-1', 'u-1', { roleUuid: 'r-super' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to modify coreAdmin', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      userRepo.findOne.mockResolvedValue(mockCoreAdmin);

      await expect(
        service.updateMemberRole('ws-1', 'u-admin', { roleUuid: 'r-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeMember', () => {
    it('should remove member and their scope', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      userRepo.findOne.mockResolvedValue(mockUser);
      const member = { id: 101 };
      memberRepo.findOne.mockResolvedValue(member);
      const scope = { id: 301 };
      scopeRepo.findOne.mockResolvedValue(scope);

      await service.removeMember('ws-1', 'u-1');
      expect(memberRepo.remove).toHaveBeenCalledWith(member);
      expect(scopeRepo.remove).toHaveBeenCalledWith(scope);
    });

    it('should throw BadRequestException when trying to remove coreAdmin', async () => {
      workspaceRepo.findOne.mockResolvedValue(mockWorkspace);
      userRepo.findOne.mockResolvedValue(mockCoreAdmin);

      await expect(service.removeMember('ws-1', 'u-admin')).rejects.toThrow(BadRequestException);
    });
  });
});
