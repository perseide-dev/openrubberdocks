import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '@moduleUsers/services/users.service';
import { CreateUserDto } from '@moduleUsers/dto/create-user.dto';
import { UpdateUserDto } from '@moduleUsers/dto/update-user.dto';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { PermissionsGuard } from '@commonGuards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseInterceptors(new JsonApiInterceptor('users'))
  @RequirePermissions('role:read')
  @Get()
  findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @UseInterceptors(new JsonApiInterceptor('users'))
  @RequirePermissions('role:assign')
  @Post()
  create(@JsonApiBody() createUsersDto: CreateUserDto) {
    return this.usersService.create(createUsersDto);
  }

  @UseInterceptors(new JsonApiInterceptor('users'))
  @RequirePermissions('role:assign')
  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @JsonApiBody() updateUsersDto: UpdateUserDto,
  ) {
    return this.usersService.update(uuid, updateUsersDto);
  }
}
