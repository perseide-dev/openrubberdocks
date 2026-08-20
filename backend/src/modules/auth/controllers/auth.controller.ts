import { Controller, Post, Res, Req, UseGuards, Get, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { AuthService } from '@moduleAuth/services/auth.service';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JsonApiInterceptor } from '../../../common/interceptors/json-api.interceptor';
import { JsonApiBody } from '../../../common/decorators/json-api-body.decorator';
import { ValidateUserDTO } from '../dto/validate-user.dto';
import { RefreshTokenPayload } from '../interface/auth.interface';

@UseInterceptors(new JsonApiInterceptor('users'))
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@JsonApiBody() body: ValidateUserDTO, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUser(body);
    if (!user) {
      response.status(HttpStatus.UNAUTHORIZED).send({ errors: [{ status: '401', title: 'Unauthorized', detail: 'Invalid credentials' }] });
      return;
    }

    const tokens = await this.authService.generateTokens(user.id, user.email);
    await this.authService.updateRefreshToken(user.id, tokens.refreshToken);

    response.cookie('Authentication', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Returning user directly so the JsonApiInterceptor formats it
    return user;
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const user = request.user as RefreshTokenPayload;

    const tokenPayload =
    {
      userUUID: user.uuid,
      refreshToken: user.refreshToken
    };

    const tokens = await this.authService.refreshTokens(tokenPayload);

    response.cookie('Authentication', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // We can return the user object, or null
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const user = request.user as any;
    await this.authService.logout(user.id);

    response.clearCookie('Authentication', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    response.clearCookie('Refresh', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return null; // Will result in { data: null } via JsonApiInterceptor
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
