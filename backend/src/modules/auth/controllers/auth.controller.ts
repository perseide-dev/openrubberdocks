import { Controller, Post, Res, Req, UseGuards, Get, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { AuthService } from '@moduleAuth/services/auth.service';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { ValidateUserDTO } from '@moduleAuth/dto/validate-user.dto';
import { RefreshTokenPayload } from '@moduleAuth/interface/auth.interface';
import { buildGenerateTokenPayload, buildTokenPayload } from '@moduleAuth/utils/token-payload.util';

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

    const tokens = await this.authService.generateTokens(buildGenerateTokenPayload(user));
    await this.authService.updateRefreshToken(buildTokenPayload(tokens));

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

    const tokens = await this.authService.refreshTokens(buildTokenPayload(user));

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
