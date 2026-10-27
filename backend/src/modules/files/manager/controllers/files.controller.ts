import { Controller, Get, Post, Patch, Delete, Param, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { FilesService } from '@moduleFiles/manager/services/files.service';
import { CreateFileDto } from '@moduleFiles/manager/dto/create-file.dto';
import { UpdateFileDto } from '@moduleFiles/manager/dto/update-file.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { JsonApiQuery } from '@commonDecorators/json-api-query.decorator';
import type { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { CheckScope } from '@commonDecorators/check-scope.decorator';
import { PermissionsGuard } from '@commonGuards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@UseInterceptors(new JsonApiInterceptor('pages'))
@Controller('pages')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @RequirePermissions('document:write')
  @CheckScope('workspaceUuid')
  create(@JsonApiBody() createFileDto: CreateFileDto, @Req() request: Request) {
    const user = request.user as any;
    return this.filesService.create(createFileDto, user.uuid);
  }

  @Get()
  @RequirePermissions('document:read')
  findAll(@JsonApiQuery() query: JsonApiQueryOptions) {
    return this.filesService.findAll(query);
  }

  @Get(':uuid')
  @RequirePermissions('document:read')
  findOne(@Param('uuid') uuid: string, @JsonApiQuery() query: JsonApiQueryOptions) {
    return this.filesService.findOne(uuid, query);
  }

  @Patch(':uuid')
  @RequirePermissions('document:write')
  update(@Param('uuid') uuid: string, @JsonApiBody() updateFileDto: UpdateFileDto) {
    return this.filesService.update(uuid, updateFileDto);
  }

  @Delete(':uuid')
  @RequirePermissions('document:delete')
  remove(@Param('uuid') uuid: string) {
    return this.filesService.remove(uuid);
  }
}
