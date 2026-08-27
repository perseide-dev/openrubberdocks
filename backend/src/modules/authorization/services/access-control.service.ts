import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { UserType } from '@moduleUsers/enums/users.enum';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(UserRoleScope)
    private readonly userRoleScopeRepository: Repository<UserRoleScope>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async hasPermission(userId: number, requiredPermission: string, workspaceUuid?: string, squadId?: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return false;
    }

    // Rule 1: Core User is supreme, ignores scoping and has all permissions.
    if (user.type === UserType.COREADMIN) {
      return true;
    }

    // Fetch all user scopes with roles, permissions, and workspace
    const scopes = await this.userRoleScopeRepository.find({
      where: { user: { id: userId } },
      relations: ['role', 'role.permissions', 'workspace'],
    });

    if (scopes.length === 0) {
      return false;
    }

    for (const scope of scopes) {
      const hasPermissionAction = scope.role.permissions.some(p => p.action === requiredPermission);
      
      if (hasPermissionAction) {
        // External users MUST have a specific workspaceId or squadId matched
        if (user.type === UserType.EXTERNAL) {
          // If required is read-only, ensure they are in the scope
          if (requiredPermission.includes('write') || requiredPermission.includes('create') || requiredPermission.includes('edit') || requiredPermission.includes('delete')) {
            continue; // External users cannot write, ever, even if assigned a role with write permission
          }
          if (workspaceUuid && scope.workspace?.uuid === workspaceUuid) return true;
          if (squadId && scope.squadId === squadId) return true;
          continue;
        }

        // Internal users: Super Admins (CTO) have workspaceId = null (global)
        if (scope.workspaceId === null && scope.squadId === null) {
          return true; // Global scope, applies everywhere
        }

        // Check if the current scope matches the requested scope
        if (workspaceUuid && scope.workspace?.uuid === workspaceUuid) {
          return true;
        }

        if (squadId && scope.squadId === squadId) {
          return true;
        }
      }
    }

    return false;
  }
}
