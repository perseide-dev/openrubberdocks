import { Controller, Get, Post, Patch, Delete, Param, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { BlocksService } from '@moduleFiles/blocks/services/blocks.service';
import { CreateBlockDto } from '@moduleFiles/blocks/dto/create-block.dto';
import { UpdateBlockDto } from '@moduleFiles/blocks/dto/update-block.dto';
import { MoveBlockDto } from '@moduleFiles/blocks/dto/move-block.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { JsonApiQuery } from '@commonDecorators/json-api-query.decorator';
import type { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { PermissionsGuard } from '@commonGuards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@UseInterceptors(new JsonApiInterceptor('blocks'))
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  @RequirePermissions('document:write')
  create(@JsonApiBody() createBlockDto: CreateBlockDto, @Req() request: Request) {
    const user = request.user as any;
    return this.blocksService.create(createBlockDto, user.uuid);
  }

  @Get()
  @RequirePermissions('document:read')
  findAll(@JsonApiQuery() query: JsonApiQueryOptions) {
    return this.blocksService.findAll(query);
  }

  @Get(':uuid')
  @RequirePermissions('document:read')
  findOne(@Param('uuid') uuid: string, @JsonApiQuery() query: JsonApiQueryOptions) {
    return this.blocksService.findOne(uuid, query);
  }

  @Patch(':uuid')
  @RequirePermissions('document:write')
  update(@Param('uuid') uuid: string, @JsonApiBody() updateBlockDto: UpdateBlockDto, @Req() request: Request) {
    const user = request.user as any;
    return this.blocksService.update(uuid, updateBlockDto, user.uuid);
  }

  @Patch(':uuid/move')
  @RequirePermissions('document:write')
  move(@Param('uuid') uuid: string, @JsonApiBody() moveBlockDto: MoveBlockDto) {
    return this.blocksService.move(uuid, moveBlockDto);
  }

  @Delete(':uuid')
  @RequirePermissions('document:write')
  remove(@Param('uuid') uuid: string) {
    return this.blocksService.remove(uuid);
  }
}
