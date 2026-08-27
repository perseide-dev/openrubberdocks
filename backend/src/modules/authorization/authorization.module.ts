import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRoleScope } from './entities/user-role-scope.entity';
import { AccessControlService } from './services/access-control.service';
import { RoleManagementService } from './services/role-management.service';
import { AuthorizationController } from './controllers/authorization.controller';
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
