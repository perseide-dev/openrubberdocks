import {
  Controller,
  Post,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';



@Controller('userss')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@JsonApiBody() createUsersDto: CreateUserDto) {
    return this.usersService.create(createUsersDto);
  }

}
