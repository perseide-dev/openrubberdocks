import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@moduleUsers/services/users.service';
import { ValidateUserDTO } from '@moduleAuth/dto/validate-user.dto';
import { RefreshTokenDto } from '@moduleAuth/dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(validateUserDto: ValidateUserDTO): Promise<any> {
    const user = await this.usersService.findByRubberHandle(validateUserDto.rubberHanlde);
    if (user && user.password && (await bcrypt.compare(validateUserDto.pwd, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Incorrect username or password');
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const user = await this.usersService.findById(refreshTokenDto.userUUID);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens(user.uuid, user.rubberHandle);
    await this.updateRefreshToken(user.uuid, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }
}
