import { Module } from '@nestjs/common';
import { AuthService } from '@moduleAuth/services/auth.service';
import { AuthController } from '@moduleAuth/controllers/auth.controller';
import { UsersModule } from '@moduleUsers/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, JwtRefreshStrategy } from '@moduleAuth/strategies/index';
import { PassportModule } from '@nestjs/passport';
import { AccessControlService } from '@modules/authorization/services/access-control.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleScope } from '@modules/authorization/entities/user-role-scope.entity';
import { User } from '@modules/users/entities/user.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserRoleScope, User])
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, AccessControlService],
  controllers: [AuthController],
  exports: [AccessControlService]
})
export class AuthModule { }
