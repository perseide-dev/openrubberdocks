import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { Permission } from '@moduleAuthorization/entities/permission.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';
import { RoleManagementService } from '@moduleAuthorization/services/role-management.service';
import { AuthorizationController } from '@moduleAuthorization/controllers/authorization.controller';
import { User } from '@moduleUsers/entities/user.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, UserRoleScope, User, Workspace])
  ],
  controllers: [AuthorizationController],
  providers: [AccessControlService, RoleManagementService],
  exports: [AccessControlService, RoleManagementService],
})
export class AuthorizationModule {}
