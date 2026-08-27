import { Controller, Get, Post, Patch, Delete, Param, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { BlocksService } from '../services/blocks.service';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { MoveBlockDto } from '../dto/move-block.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { JsonApiQuery } from '@commonDecorators/json-api-query.decorator';
import type { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(new JsonApiInterceptor('blocks'))
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(@JsonApiBody() createBlockDto: CreateBlockDto, @Req() request: Request) {
    const user = request.user as any;
    return this.blocksService.create(createBlockDto, user.uuid);
  }

  @Get()
  findAll(@JsonApiQuery() query: JsonApiQueryOptions) {
    return this.blocksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @JsonApiQuery() query: JsonApiQueryOptions) {
    return this.blocksService.findOne(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @JsonApiBody() updateBlockDto: UpdateBlockDto, @Req() request: Request) {
    const user = request.user as any;
    return this.blocksService.update(id, updateBlockDto, user.uuid);
  }

  @Patch(':id/move')
  move(@Param('id') id: string, @JsonApiBody() moveBlockDto: MoveBlockDto) {
    return this.blocksService.move(id, moveBlockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blocksService.remove(id);
  }
}
