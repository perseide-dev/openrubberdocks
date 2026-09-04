import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@moduleUsers/services/users.service';
import { AUTH_ERRORS_CONSTANTS } from '@moduleAuth/constants/auth.errors.constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Refresh;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    const refreshToken = request?.cookies?.Refresh;
    if (!refreshToken) {
      throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.UNAUTHORIZED_ACCESS());
    }

    const user = await this.usersService.findById(payload.userUUID);
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.UNAUTHORIZED_ACCESS());
    }

    return { ...user, refreshToken };
  }
}
