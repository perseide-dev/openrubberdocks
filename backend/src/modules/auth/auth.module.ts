import { Module } from '@nestjs/common';
import { AuthService } from '@moduleAuth/services/auth.service';
import { AuthController } from '@moduleAuth/controllers/auth.controller';
import { ApiKeysService } from '@moduleAuth/services/api-keys.service';
import { ApiKeysController } from '@moduleAuth/controllers/api-keys.controller';
import { UsersModule } from '@moduleUsers/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, JwtRefreshStrategy } from '@moduleAuth/strategies/index';
import { PassportModule } from '@nestjs/passport';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { ApiKey } from '@moduleAuth/entities/api-key.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserRoleScope, User, ApiKey]),
  ],
  providers: [AuthService, ApiKeysService, JwtStrategy, JwtRefreshStrategy, AccessControlService],
  controllers: [AuthController, ApiKeysController],
  exports: [AccessControlService, ApiKeysService],
})
export class AuthModule { }
