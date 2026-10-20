import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { WorkspaceMember } from '@moduleWorkspace/entities/workspace-member.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { WorkspaceController } from '@moduleWorkspace/controllers/workspace.controller';
import { WorkspaceMembersController } from '@moduleWorkspace/controllers/workspace-members.controller';
import { WorkspaceService } from '@moduleWorkspace/services/workspace.service';
import { WorkspaceMembersService } from '@moduleWorkspace/services/workspace-members.service';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      WorkspaceMember,
      User,
      Role,
      UserRoleScope,
    ]),
    AuthModule,
  ],
  controllers: [WorkspaceController, WorkspaceMembersController],
  providers: [WorkspaceService, WorkspaceMembersService],
  exports: [WorkspaceService, WorkspaceMembersService],
})
export class WorkspaceModule { }

