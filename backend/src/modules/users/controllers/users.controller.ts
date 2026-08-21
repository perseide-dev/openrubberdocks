import {
  Controller,
  Post,
} from '@nestjs/common';
import { UsersService } from '@moduleUsers/services/users.service';
import { CreateUserDto } from '@moduleUsers/dto/create-user.dto';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';



@Controller('userss')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@JsonApiBody() createUsersDto: CreateUserDto) {
    return this.usersService.create(createUsersDto);
  }

}
