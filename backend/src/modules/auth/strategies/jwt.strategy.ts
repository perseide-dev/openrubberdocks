import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '@moduleUsers/services/users.service';
import { AUTH_ERRORS_CONSTANTS } from '@moduleAuth/constants/auth.errors.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.userUUID);
    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.UNAUTHORIZED_ACCESS());
    }
    return user;
  }
}
