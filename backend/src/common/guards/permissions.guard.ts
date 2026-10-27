import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@commonDecorators/require-permissions.decorator';
import { SCOPE_KEY } from '@commonDecorators/check-scope.decorator';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

const GLOBAL_ONLY_PERMISSIONS = new Set([
  'role:create',
  'role:update',
  'role:delete',
  'user:manage',
  'global:audit',
]);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accessControlService: AccessControlService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated properly');
    }

    const scopeParam = this.reflector.getAllAndOverride<string>(SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requestPath = (request.originalUrl || request.url || '').split('?')[0];
    const isGlobalAdminRoute =
      requestPath.startsWith('/users') ||
      requestPath.startsWith('/authorization/roles');
    const hasGlobalOnlyPermission = requiredPermissions.some((p) =>
      GLOBAL_ONLY_PERMISSIONS.has(p),
    );

    let workspaceUuid: string | undefined;
    if (scopeParam) {
      workspaceUuid =
        request.params?.[scopeParam] ||
        request.body?.data?.attributes?.[scopeParam] ||
        request.body?.[scopeParam] ||
        request.query?.[scopeParam];
    } else if (!isGlobalAdminRoute && !hasGlobalOnlyPermission) {
      workspaceUuid =
        request.body?.data?.attributes?.workspaceUuid ||
        request.body?.workspaceUuid ||
        request.query?.workspaceUuid;
    }

    const userOrId = Array.isArray(user.scopes) ? user : user.id;

    for (const permission of requiredPermissions) {
      const hasAccess = await this.accessControlService.hasPermission(
        userOrId,
        permission,
        workspaceUuid,
      );
      if (!hasAccess) {
        throw new ForbiddenException(`Missing permission: ${permission} in the current scope`);
      }
    }

    return true;
  }
}
