import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkspaceMembersService } from '@moduleWorkspace/services/workspace-members.service';
import { AddWorkspaceMemberDto } from '@moduleWorkspace/dto/add-workspace-member.dto';
import { UpdateMemberRoleDto } from '@moduleWorkspace/dto/update-member-role.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { CheckScope } from '@commonDecorators/check-scope.decorator';
import { PermissionsGuard } from '@commonGuards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@UseInterceptors(new JsonApiInterceptor('workspace_members'))
@Controller('workspaces/:uuid/members')
export class WorkspaceMembersController {
  constructor(private readonly membersService: WorkspaceMembersService) {}

  @Get()
  @RequirePermissions('workspace:read')
  @CheckScope('uuid')
  findAll(@Param('uuid') workspaceUuid: string) {
    return this.membersService.findMembers(workspaceUuid);
  }

  @Post()
  @RequirePermissions('workspace:write')
  @CheckScope('uuid')
  addMember(
    @Param('uuid') workspaceUuid: string,
    @JsonApiBody() dto: AddWorkspaceMemberDto,
  ) {
    return this.membersService.addMember(workspaceUuid, dto);
  }

  @Patch(':userUuid')
  @RequirePermissions('workspace:write')
  @CheckScope('uuid')
  updateMemberRole(
    @Param('uuid') workspaceUuid: string,
    @Param('userUuid') userUuid: string,
    @JsonApiBody() dto: UpdateMemberRoleDto,
  ) {
    return this.membersService.updateMemberRole(workspaceUuid, userUuid, dto);
  }

  @Delete(':userUuid')
  @RequirePermissions('workspace:write')
  @CheckScope('uuid')
  async removeMember(
    @Param('uuid') workspaceUuid: string,
    @Param('userUuid') userUuid: string,
  ) {
    await this.membersService.removeMember(workspaceUuid, userUuid);
    return { data: null };
  }
}
