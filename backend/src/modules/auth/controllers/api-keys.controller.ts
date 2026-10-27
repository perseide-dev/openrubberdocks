import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { ApiKeysService } from '@moduleAuth/services/api-keys.service';
import { CreateApiKeyDto } from '@moduleAuth/dto/create-api-key.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { User } from '@moduleUsers/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@UseInterceptors(new JsonApiInterceptor('api-keys'))
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  async findAll(@Req() request: Request) {
    const user = request.user as User;
    return this.apiKeysService.listKeysForUser(user.id);
  }

  @Post()
  async create(@JsonApiBody() createApiKeyDto: CreateApiKeyDto, @Req() request: Request) {
    const user = request.user as User;
    const result = await this.apiKeysService.createApiKey(user.id, createApiKeyDto);
    return {
      ...result.apiKey,
      rawKey: result.rawKey,
    };
  }

  @Patch(':uuid/revoke')
  async revoke(@Param('uuid') uuid: string, @Req() request: Request) {
    const user = request.user as User;
    return this.apiKeysService.revokeKey(uuid, user.id);
  }

  @Delete(':uuid')
  async remove(@Param('uuid') uuid: string, @Req() request: Request) {
    const user = request.user as User;
    await this.apiKeysService.deleteKey(uuid, user.id);
    return { success: true };
  }
}
