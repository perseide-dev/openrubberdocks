import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRoleScope])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
