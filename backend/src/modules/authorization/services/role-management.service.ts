import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { Permission } from '@moduleAuthorization/entities/permission.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { CreateRoleDto } from '@moduleAuthorization/dto/create-role.dto';
import { UpdateRoleDto } from '@moduleAuthorization/dto/update-role.dto';
import { AssignRoleScopeDto } from '@moduleAuthorization/dto/assign-role-scope.dto';
import { AUTHORIZATION_ERRORS } from '@moduleAuthorization/constants/authorization.errors.constants';
import type { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';

@Injectable()
export class RoleManagementService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserRoleScope)
    private readonly scopeRepository: Repository<UserRoleScope>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async findAll(query: JsonApiQueryOptions) {
    return this.roleRepository.find({
      relations: query.relations || [],
      // In a full JSON:API implementation you would also map query.filters here
    });
  }

  async findOne(uuid: string, query: JsonApiQueryOptions) {
    const role = await this.roleRepository.findOne({
      where: { uuid },
      relations: query.relations || [],
    });

    if (!role) {
      throw new NotFoundException(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND());
    }

    return role;
  }

  async create(createDto: CreateRoleDto) {
    const role = this.roleRepository.create({
      name: createDto.name,
      description: createDto.description,
      isSystemDefined: false,
    });

    if (createDto.permissionUuids && createDto.permissionUuids.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { uuid: In(createDto.permissionUuids) },
      });
      
      if (permissions.length !== createDto.permissionUuids.length) {
        throw new BadRequestException(AUTHORIZATION_ERRORS.PERMISSION_NOT_FOUND());
      }
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async update(uuid: string, updateDto: UpdateRoleDto) {
    const role = await this.findOne(uuid, { relations: [] });

    if (role.isSystemDefined) {
      throw new BadRequestException(AUTHORIZATION_ERRORS.CANNOT_MODIFY_SYSTEM_ROLE());
    }

    if (updateDto.name) role.name = updateDto.name;
    if (updateDto.description) role.description = updateDto.description;

    if (updateDto.permissionUuids) {
      const permissions = await this.permissionRepository.find({
        where: { uuid: In(updateDto.permissionUuids) },
      });
      
      if (permissions.length !== updateDto.permissionUuids.length) {
        throw new BadRequestException(AUTHORIZATION_ERRORS.PERMISSION_NOT_FOUND());
      }
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async remove(uuid: string) {
    const role = await this.findOne(uuid, { relations: [] });

    if (role.isSystemDefined) {
      throw new BadRequestException(AUTHORIZATION_ERRORS.CANNOT_MODIFY_SYSTEM_ROLE());
    }

    await this.roleRepository.remove(role);
    return { data: null }; // Required for JSON:API empty responses
  }

  async assignScope(assignDto: AssignRoleScopeDto) {
    const user = await this.userRepository.findOne({ where: { uuid: assignDto.userUuid } });
    if (!user) throw new NotFoundException('User not found');
    
    if (user.type === 'coreAdmin') { // From UserType.COREADMIN
      throw new BadRequestException(AUTHORIZATION_ERRORS.CANNOT_MODIFY_CORE_USER());
    }

    const role = await this.findOne(assignDto.roleUuid, { relations: [] });

    let workspace: Workspace | null = null;
    if (assignDto.workspaceUuid) {
      workspace = await this.workspaceRepository.findOne({ where: { uuid: assignDto.workspaceUuid } });
      if (!workspace) throw new NotFoundException('Workspace not found');
    }

    // External users MUST have a scope
    if (user.type === 'external' && !workspace && !assignDto.squadUuid) {
      throw new BadRequestException(AUTHORIZATION_ERRORS.INVALID_SCOPE_ASSIGNMENT());
    }

    const newScope = this.scopeRepository.create({
      user,
      role,
      workspace: workspace || undefined,
    });

    return this.scopeRepository.save(newScope);
  }
}
