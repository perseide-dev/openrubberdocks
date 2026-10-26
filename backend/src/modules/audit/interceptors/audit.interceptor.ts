import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { AuditService } from '@moduleAudit/services/audit.service';
import { SKIP_AUDIT_KEY } from '@moduleAudit/decorators/skip-audit.decorator';
import { sanitizePayload } from '@moduleAudit/utils/audit-sanitizer.util';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const isSkip = this.reflector.getAllAndOverride<boolean>(SKIP_AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSkip) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const method = req.method?.toUpperCase();
    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const path = req.originalUrl || req.url || '';
    if (path.includes('/audit-logs')) {
      return next.handle();
    }

    const startTime = Date.now();
    const user = (req as any).user;

    const segments = path.replace(/^\//, '').split('?')[0].split('/');
    const resourceType = segments[0] || 'unknown';

    // Extract workspaceUuid if relevant
    const workspaceUuid =
      req.params?.workspaceUuid ||
      req.params?.uuid ||
      req.query?.workspaceUuid ||
      (resourceType === 'workspaces' && req.params?.uuid ? req.params.uuid : undefined) ||
      (req.body as any)?.workspaceUuid ||
      (req.body as any)?.data?.attributes?.workspaceUuid ||
      null;

    const resourceUuid =
      req.params?.uuid ||
      req.params?.id ||
      (req.body as any)?.data?.id ||
      null;

    const action = `${resourceType.toUpperCase()}_${method}`;

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      null;

    const userAgent = (req.headers['user-agent'] as string) || null;

    const sanitizedPayload = req.body
      ? (sanitizePayload(req.body) as Record<string, any>)
      : null;

    return next.handle().pipe(
      tap({
        next: () => {
          const executionTimeMs = Date.now() - startTime;
          const statusCode = res.statusCode || (method === 'POST' ? 201 : 200);

          void this.auditService.logEvent({
            userId: user?.id ?? null,
            userEmail: user?.email ?? null,
            userType: user?.type ?? null,
            action,
            resourceType,
            resourceUuid: typeof resourceUuid === 'string' ? resourceUuid : null,
            workspaceUuid: typeof workspaceUuid === 'string' ? workspaceUuid : null,
            status: 'SUCCESS',
            statusCode,
            executionTimeMs,
            ipAddress: clientIp,
            userAgent,
            payload: sanitizedPayload,
            errorMessage: null,
          });
        },
        error: (err) => {
          const executionTimeMs = Date.now() - startTime;
          const statusCode = err.status || err.statusCode || 500;

          void this.auditService.logEvent({
            userId: user?.id ?? null,
            userEmail: user?.email ?? null,
            userType: user?.type ?? null,
            action,
            resourceType,
            resourceUuid: typeof resourceUuid === 'string' ? resourceUuid : null,
            workspaceUuid: typeof workspaceUuid === 'string' ? workspaceUuid : null,
            status: 'FAILURE',
            statusCode,
            executionTimeMs,
            ipAddress: clientIp,
            userAgent,
            payload: sanitizedPayload,
            errorMessage: err?.message || 'Unknown error occurred',
          });
        },
      }),
    );
  }
}
