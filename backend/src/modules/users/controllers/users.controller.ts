import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '@moduleUsers/services/users.service';
import { CreateUserDto } from '@moduleUsers/dto/create-user.dto';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';

@Controller(['users', 'userss'])
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(new JsonApiInterceptor('users'))
  @Get()
  findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Post()
  create(@JsonApiBody() createUsersDto: CreateUserDto) {
    return this.usersService.create(createUsersDto);
  }
}
