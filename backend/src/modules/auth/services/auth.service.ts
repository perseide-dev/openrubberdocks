import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@moduleUsers/services/users.service';
import { UpdateTokenDTO, ValidateUserDTO, RefreshTokenDto, GenerateTokenDto } from '@moduleAuth/dto/index';
import * as bcrypt from 'bcrypt';
import { User } from '@moduleUsers/entities/user.entity';
import { buildGenerateTokenPayload, buildTokenPayload } from '@moduleAuth/utils/token-payload.util';
import { AUTH_ERRORS_CONSTANTS } from '@moduleAuth/constants/auth.errors.constants';
import { AuthTokens } from '@moduleAuth/interface/auth.interface';
import { AuditService } from '@moduleAudit/services/audit.service';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Optional() private auditService?: AuditService,
  ) { }

  async validateUser(validateUserDto: ValidateUserDTO): Promise<User> {
    const user = await this.usersService.findByRubberHandle(validateUserDto.rubberHandle);
    if (user && user.password && (await bcrypt.compare(validateUserDto.pwd, user.password))) {
      void this.auditService?.logEvent({
        userId: user.id,
        userEmail: user.rubberHandle,
        userType: user.type,
        action: 'AUTH_LOGIN_SUCCESS',
        resourceType: 'auth',
        resourceUuid: user.uuid,
        status: 'SUCCESS',
        statusCode: 200,
      });
      return user;
    }

    void this.auditService?.logEvent({
      action: 'AUTH_LOGIN_FAILED',
      resourceType: 'auth',
      status: 'FAILURE',
      statusCode: 401,
      errorMessage: 'Invalid credentials',
      payload: { rubberHandle: validateUserDto.rubberHandle },
    });

    throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.INVALID_CREDENTIALS());
  }

  async generateTokens(generateToken: GenerateTokenDto): Promise<AuthTokens> {
    const accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(generateToken, {
        secret: accessSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(generateToken, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(updateToken: UpdateTokenDTO) {
    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS')) || 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedRefreshToken = await bcrypt.hash(updateToken.refreshToken, salt);
    await this.usersService.updateRefreshToken(updateToken.userUUID, hashedRefreshToken);
  }

  async refreshTokens(refreshToken: RefreshTokenDto): Promise<AuthTokens> {
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
    await this.updateRefreshToken(
      buildTokenPayload({ uuid: user.uuid, refreshToken: tokens.refreshToken }),
    );
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    void this.auditService?.logEvent({
      action: 'AUTH_LOGOUT',
      resourceType: 'auth',
      resourceUuid: userId,
      status: 'SUCCESS',
      statusCode: 200,
    });
  }
}
