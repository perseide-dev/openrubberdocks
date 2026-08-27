import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { SCOPE_KEY } from '../decorators/check-scope.decorator';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

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

    let workspaceUuid: string | undefined;
    if (scopeParam && request.params[scopeParam]) {
      workspaceUuid = request.params[scopeParam];
    }

    for (const permission of requiredPermissions) {
      const hasAccess = await this.accessControlService.hasPermission(user.id, permission, workspaceUuid);
      if (!hasAccess) {
        throw new ForbiddenException(`Missing permission: ${permission} in the current scope`);
      }
    }

    return true;
  }
}
