import { Module } from '@nestjs/common';
import { AuthService } from '@moduleAuth/services/auth.service';
import { AuthController } from '@moduleAuth//controllers/auth.controller';
import { UsersModule } from '@moduleUsers/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@moduleAuth//strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@moduleAuth//strategies/jwt-refresh.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
