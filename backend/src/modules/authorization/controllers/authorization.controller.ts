import { Controller, Get, Post, Patch, Delete, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleManagementService } from '../services/role-management.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { AssignRoleScopeDto } from '../dto/assign-role-scope.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { JsonApiQuery } from '@commonDecorators/json-api-query.decorator';
import type { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { PermissionsGuard } from '@commonGuards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('authorization')
export class AuthorizationController {
  constructor(private readonly roleService: RoleManagementService) {}

  @UseInterceptors(new JsonApiInterceptor('roles'))
  @Get('roles')
  @RequirePermissions('role:read') // Assuming you add this to permissions list
  findAllRoles(@JsonApiQuery() query: JsonApiQueryOptions) {
    return this.roleService.findAll(query);
  }

  @UseInterceptors(new JsonApiInterceptor('roles'))
  @Get('roles/:uuid')
  @RequirePermissions('role:read')
  findOneRole(@Param('uuid') uuid: string, @JsonApiQuery() query: JsonApiQueryOptions) {
    return this.roleService.findOne(uuid, query);
  }

  @UseInterceptors(new JsonApiInterceptor('roles'))
  @Post('roles')
  @RequirePermissions('role:create')
  createRole(@JsonApiBody() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @UseInterceptors(new JsonApiInterceptor('roles'))
  @Patch('roles/:uuid')
  @RequirePermissions('role:update')
  updateRole(@Param('uuid') uuid: string, @JsonApiBody() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(uuid, updateRoleDto);
  }

  @Delete('roles/:uuid')
  @RequirePermissions('role:delete')
  removeRole(@Param('uuid') uuid: string) {
    return this.roleService.remove(uuid);
  }

  @UseInterceptors(new JsonApiInterceptor('user_role_scopes'))
  @Post('scopes')
  @RequirePermissions('role:assign')
  assignScope(@JsonApiBody() assignDto: AssignRoleScopeDto) {
    return this.roleService.assignScope(assignDto);
  }
}
