import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AuditInterceptor } from '@moduleAudit/interceptors/audit.interceptor';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let mockAuditService: any;
  let mockReflector: any;

  beforeEach(() => {
    mockAuditService = {
      logEvent: jest.fn().mockResolvedValue(undefined),
    };
    mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    };
    interceptor = new AuditInterceptor(mockAuditService, mockReflector);
  });

  const createMockContext = (method: string, path: string, body: any = {}, user: any = null): ExecutionContext => {
    const req: any = {
      method,
      originalUrl: path,
      headers: { 'user-agent': 'Jest-Agent' },
      body,
      user,
    };
    const res: any = {
      statusCode: method === 'POST' ? 201 : 200,
    };

    return {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('should ignore non-mutating GET requests', (done) => {
    const context = createMockContext('GET', '/workspaces');
    const next: CallHandler = {
      handle: () => of({ data: 'ok' }),
    };

    interceptor.intercept(context, next).subscribe({
      next: (val) => {
        expect(val).toEqual({ data: 'ok' });
        expect(mockAuditService.logEvent).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should capture mutating POST request and call logEvent', (done) => {
    const context = createMockContext('POST', '/workspaces', { name: 'WS-1' }, { id: 10, email: 'user@test.io' });
    const next: CallHandler = {
      handle: () => of({ id: 1, name: 'WS-1' }),
    };

    interceptor.intercept(context, next).subscribe({
      next: () => {
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'WORKSPACES_POST',
            resourceType: 'workspaces',
            status: 'SUCCESS',
            userId: 10,
            userEmail: 'user@test.io',
          }),
        );
        done();
      },
    });
  });

  it('should capture failed requests and log error status', (done) => {
    const context = createMockContext('DELETE', '/workspaces/uuid-123', null, { id: 5 });
    const next: CallHandler = {
      handle: () => throwError(() => new Error('Forbidden action')),
    };

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err.message).toBe('Forbidden action');
        expect(mockAuditService.logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'WORKSPACES_DELETE',
            status: 'FAILURE',
            errorMessage: 'Forbidden action',
          }),
        );
        done();
      },
    });
  });
});
