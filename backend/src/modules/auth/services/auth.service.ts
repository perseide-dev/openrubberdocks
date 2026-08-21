import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@moduleUsers/services/users.service';
import { UpdateTokenDTO, ValidateUserDTO, RefreshTokenDto, GenerateTokenDto } from '@moduleAuth/dto/index';
import * as bcrypt from 'bcrypt';
import { User } from '@moduleUsers/entities/user.entity';
import { buildGenerateTokenPayload, buildTokenPayload } from '@moduleAuth/utils/token-payload.util';
import { AUTH_ERRORS_CONSTANTS } from '@moduleAuth/constants/auth.errors.constants';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(validateUserDto: ValidateUserDTO): Promise<User> {
    const user = await this.usersService.findByRubberHandle(validateUserDto.rubberHanlde);
    if (user && user.password && (await bcrypt.compare(validateUserDto.pwd, user.password))) {
      return user;
    }
    throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.INVALID_CREDENTIALS());
  }

  async generateTokens(generateToken: GenerateTokenDto): Promise<any> {

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(generateToken, {
        secret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(generateToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(updateToken: UpdateTokenDTO) {
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(updateToken.refreshToken, salt);
    await this.usersService.updateRefreshToken(updateToken.userUUID, hashedRefreshToken);
  }

  async refreshTokens(refreshToken: RefreshTokenDto) {
    const user = await this.usersService.findById(refreshToken.userUUID);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.ACCESS_DENIED());
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken.refreshToken,
      user.hashedRefreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.ACCESS_DENIED());
    }

    const tokens = await this.generateTokens(buildGenerateTokenPayload(user));
    await this.updateRefreshToken(buildTokenPayload(tokens));
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }
}
