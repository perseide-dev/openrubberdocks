import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from '@moduleAuth/services/api-keys.service';

@Injectable()
export class McpAuthGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'Missing API key. Provide via Authorization header (Bearer ord_live_...), x-api-key header, or ?token= query parameter.',
      );
    }

    const user = await this.apiKeysService.validateKey(token);
    (request as any).user = user;

    return true;
  }

  private extractToken(request: Request): string | null {
    // 1. Authorization: Bearer <token>
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    // 2. x-api-key header
    const xApiKey = request.headers['x-api-key'];
    if (xApiKey && typeof xApiKey === 'string') {
      return xApiKey.trim();
    }

    // 3. Query parameter: token or apiKey
    const queryToken = request.query?.token || request.query?.apiKey;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken.trim();
    }

    return null;
  }
}
