import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { WorkspaceMember } from '@moduleWorkspace/entities/workspace-member.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { UserType } from '@moduleUsers/enums/users.enum';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { AddWorkspaceMemberDto } from '@moduleWorkspace/dto/add-workspace-member.dto';
import { UpdateMemberRoleDto } from '@moduleWorkspace/dto/update-member-role.dto';

export interface FormattedWorkspaceMember {
  id: number;
  userUuid: string;
  username: string;
  rubberHandle: string;
  userType: UserType;
  joinedAt: Date;
  role: {
    uuid: string;
    name: string;
    description?: string;
  } | null;
}

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepository: Repository<WorkspaceMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleScope)
    private readonly scopeRepository: Repository<UserRoleScope>,
  ) {}

  private async getWorkspaceByUuid(workspaceUuid: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { uuid: workspaceUuid },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace with UUID ${workspaceUuid} not found`);
    }
    return workspace;
  }

  async findMembers(workspaceUuid: string): Promise<FormattedWorkspaceMember[]> {
    const workspace = await this.getWorkspaceByUuid(workspaceUuid);

    const members = await this.memberRepository.find({
      where: { workspaceId: workspace.id },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    const scopes = await this.scopeRepository.find({
      where: { workspaceId: workspace.id },
      relations: ['role'],
    });

    const scopeByUser = new Map<number, UserRoleScope>();
    for (const scope of scopes) {
      scopeByUser.set(scope.userId, scope);
    }

    return members.map((member) => {
      const userScope = scopeByUser.get(member.userId);
      return {
        id: member.id,
        userUuid: member.user.uuid,
        username: member.user.username,
        rubberHandle: member.user.rubberHandle,
        userType: member.user.type,
        joinedAt: member.joinedAt,
        role: userScope?.role
          ? {
              uuid: userScope.role.uuid,
              name: userScope.role.name,
              description: userScope.role.description,
            }
          : null,
      };
    });
  }

  async addMember(
    workspaceUuid: string,
    dto: AddWorkspaceMemberDto,
  ): Promise<FormattedWorkspaceMember> {
    const workspace = await this.getWorkspaceByUuid(workspaceUuid);

    const user = await this.userRepository.findOne({
      where: { uuid: dto.userUuid },
    });
    if (!user) {
      throw new NotFoundException(`User with UUID ${dto.userUuid} not found`);
    }

    const role = await this.roleRepository.findOne({
      where: { uuid: dto.roleUuid },
    });
    if (!role) {
      throw new NotFoundException(`Role with UUID ${dto.roleUuid} not found`);
    }

    const existingMember = await this.memberRepository.findOne({
      where: { workspaceId: workspace.id, userId: user.id },
    });
    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    const member = this.memberRepository.create({
      workspace,
      user,
      joinedAt: new Date(),
    });
    const savedMember = await this.memberRepository.save(member);

    let scope = await this.scopeRepository.findOne({
      where: { workspaceId: workspace.id, userId: user.id },
    });
    if (!scope) {
      scope = this.scopeRepository.create({
        workspace,
        user,
        role,
      });
    } else {
      scope.role = role;
    }
    await this.scopeRepository.save(scope);

    return {
      id: savedMember.id,
      userUuid: user.uuid,
      username: user.username,
      rubberHandle: user.rubberHandle,
      userType: user.type,
      joinedAt: savedMember.joinedAt,
      role: {
        uuid: role.uuid,
        name: role.name,
        description: role.description,
      },
    };
  }

  async updateMemberRole(
    workspaceUuid: string,
    userUuid: string,
    dto: UpdateMemberRoleDto,
  ): Promise<FormattedWorkspaceMember> {
    const workspace = await this.getWorkspaceByUuid(workspaceUuid);

    const user = await this.userRepository.findOne({
      where: { uuid: userUuid },
    });
    if (!user) {
      throw new NotFoundException(`User with UUID ${userUuid} not found`);
    }

    if (user.type === UserType.COREADMIN) {
      throw new BadRequestException('Cannot modify permissions or roles of a coreAdmin user');
    }

    const member = await this.memberRepository.findOne({
      where: { workspaceId: workspace.id, userId: user.id },
    });
    if (!member) {
      throw new NotFoundException(`User is not a member of this workspace`);
    }

    const role = await this.roleRepository.findOne({
      where: { uuid: dto.roleUuid },
    });
    if (!role) {
      throw new NotFoundException(`Role with UUID ${dto.roleUuid} not found`);
    }

    let scope = await this.scopeRepository.findOne({
      where: { workspaceId: workspace.id, userId: user.id },
    });
    if (!scope) {
      scope = this.scopeRepository.create({
        workspace,
        user,
        role,
      });
    } else {
      scope.role = role;
    }
    await this.scopeRepository.save(scope);

    return {
      id: member.id,
      userUuid: user.uuid,
      username: user.username,
      rubberHandle: user.rubberHandle,
      userType: user.type,
      joinedAt: member.joinedAt,
      role: {
        uuid: role.uuid,
        name: role.name,
        description: role.description,
      },
    };
  }

  async removeMember(workspaceUuid: string, userUuid: string): Promise<void> {
    const workspace = await this.getWorkspaceByUuid(workspaceUuid);

    const user = await this.userRepository.findOne({
      where: { uuid: userUuid },
    });
    if (!user) {
      throw new NotFoundException(`User with UUID ${userUuid} not found`);
    }

    if (user.type === UserType.COREADMIN) {
      throw new BadRequestException('Cannot remove coreAdmin user from workspace');
    }

    const member = await this.memberRepository.findOne({
      where: { workspaceId: workspace.id, userId: user.id },
    });
    if (!member) {
      throw new NotFoundException(`Member not found in this workspace`);
    }

    await this.memberRepository.remove(member);

    const scope = await this.scopeRepository.findOne({
      where: { workspaceId: workspace.id, userId: user.id },
    });
    if (scope) {
      await this.scopeRepository.remove(scope);
    }
  }
}
