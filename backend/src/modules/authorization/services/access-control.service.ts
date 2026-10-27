import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { UserType } from '@moduleUsers/enums/users.enum';

export const MUTATION_VERBS = [
  'write',
  'create',
  'edit',
  'delete',
  'update',
  'manage',
  'assign',
  'time_log',
] as const;

export function isMutationAction(action: string): boolean {
  return MUTATION_VERBS.some((verb) => action.includes(verb));
}

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(UserRoleScope)
    private readonly userRoleScopeRepository: Repository<UserRoleScope>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async hasPermission(
    userOrId: number | string | User,
    requiredPermission: string,
    workspaceUuid?: string,
    squadId?: number,
  ): Promise<boolean> {
    let user: User | null = null;
    let preloadedScopes: UserRoleScope[] | undefined;

    if (typeof userOrId === 'object' && userOrId !== null) {
      user = userOrId;
      if (
        Array.isArray(user.scopes) &&
        user.scopes.every((s) => s.role && Array.isArray(s.role.permissions))
      ) {
        preloadedScopes = user.scopes;
      }
    } else {
      user = await this.userRepository.findOne({ where: { id: userOrId as number } });
    }

    if (!user) {
      return false;
    }

    // Rule 1: Core User is supreme, ignores scoping and has all permissions.
    if (user.type === UserType.COREADMIN) {
      return true;
    }

    // Fetch all user scopes with roles, permissions, and workspace if not preloaded
    const scopes =
      preloadedScopes ??
      (await this.userRoleScopeRepository.find({
        where: { user: { id: user.id } },
        relations: ['role', 'role.permissions', 'workspace'],
      }));

    if (scopes.length === 0) {
      return false;
    }

    for (const scope of scopes) {
      const hasPermissionAction = scope.role.permissions.some(p => p.action === requiredPermission);
      
      if (hasPermissionAction) {
        // External users MUST have a specific workspaceId or squadId matched
        if (user.type === UserType.EXTERNAL) {
          // If required is a mutation, ensure external users are permanently blocked
          if (isMutationAction(requiredPermission)) {
            continue; // External users cannot mutate, ever, even if assigned a role with write/update permission
          }

          // External user rule: canViewDocuments
          if (requiredPermission.startsWith('document:') && !user.canViewDocuments) {
            continue;
          }

          // External user rule: canViewProjects
          if ((requiredPermission.startsWith('project:') || requiredPermission.startsWith('task:')) && !user.canViewProjects) {
            continue;
          }

          if (workspaceUuid && scope.workspace?.uuid === workspaceUuid) return true;
          if (squadId && scope.squadId === squadId) return true;
          if (!workspaceUuid && !squadId) return true;
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

        if (!workspaceUuid && !squadId && !isMutationAction(requiredPermission)) {
          return true;
        }
      }
    }

    return false;
  }
}
