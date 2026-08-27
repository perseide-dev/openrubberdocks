import { Controller, Get, Post, Patch, Delete, Param, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { WorkspaceService } from '@moduleWorkspace/services/workspace.service';
import { CreateWorkspaceDto } from '@moduleWorkspace/dto/create-workspace.dto';
import { UpdateWorkspaceDto } from '@moduleWorkspace/dto/update-workspace.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { JsonApiQuery } from '@commonDecorators/json-api-query.decorator';
import type { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { CheckScope } from '@commonDecorators/check-scope.decorator';
import { PermissionsGuard } from '@commonGuards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@UseInterceptors(new JsonApiInterceptor('workspaces'))
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @RequirePermissions('workspace:create')
  create(@JsonApiBody() createWorkspaceDto: CreateWorkspaceDto, @Req() request: Request) {
    const user = request.user as any;
    return this.workspaceService.create(createWorkspaceDto, user.uuid);
  }

  @Get()
  @RequirePermissions('workspace:read')
  findAll(@JsonApiQuery() query: JsonApiQueryOptions) {
    return this.workspaceService.findAll(query);
  }

  @Get(':uuid')
  @RequirePermissions('workspace:read')
  @CheckScope('uuid')
  findOne(@Param('uuid') uuid: string, @JsonApiQuery() query: JsonApiQueryOptions) {
    return this.workspaceService.findOne(uuid, query);
  }

  @Patch(':uuid')
  @RequirePermissions('workspace:write')
  @CheckScope('uuid')
  update(@Param('uuid') uuid: string, @JsonApiBody() updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.workspaceService.update(uuid, updateWorkspaceDto);
  }

  @Delete(':uuid')
  @RequirePermissions('workspace:write')
  @CheckScope('uuid')
  remove(@Param('uuid') uuid: string) {
    return this.workspaceService.remove(uuid);
  }
}
