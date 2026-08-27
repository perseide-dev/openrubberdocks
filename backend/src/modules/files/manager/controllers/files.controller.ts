import { Controller, Get, Post, Patch, Delete, Param, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { FilesService } from '../services/files.service';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { JsonApiQuery } from '@commonDecorators/json-api-query.decorator';
import type { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(new JsonApiInterceptor('pages'))
@Controller('pages')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  create(@JsonApiBody() createFileDto: CreateFileDto, @Req() request: Request) {
    const user = request.user as any;
    return this.filesService.create(createFileDto, user.uuid);
  }

  @Get()
  findAll(@JsonApiQuery() query: JsonApiQueryOptions) {
    return this.filesService.findAll(query);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string, @JsonApiQuery() query: JsonApiQueryOptions) {
    return this.filesService.findOne(uuid, query);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @JsonApiBody() updateFileDto: UpdateFileDto) {
    return this.filesService.update(uuid, updateFileDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.filesService.remove(uuid);
  }
}
