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

  @Get(':id')
  findOne(@Param('id') id: string, @JsonApiQuery() query: JsonApiQueryOptions) {
    return this.filesService.findOne(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @JsonApiBody() updateFileDto: UpdateFileDto) {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
