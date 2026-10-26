import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { McpAuthGuard } from '@moduleMcp/guards/mcp-auth.guard';
import { ApiKeysService } from '@moduleAuth/services/api-keys.service';

describe('McpAuthGuard', () => {
  let guard: McpAuthGuard;
  let apiKeysService: jest.Mocked<Partial<ApiKeysService>>;

  beforeEach(() => {
    apiKeysService = {
      validateKey: jest.fn(),
    };
    guard = new McpAuthGuard(apiKeysService as ApiKeysService);
  });

  const createMockContext = (headers: Record<string, string> = {}, query: Record<string, string> = {}) => {
    const request: any = {
      headers,
      query,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should authenticate with Authorization Bearer header', async () => {
    const mockUser = { id: 1, rubberHandle: 'agent' } as any;
    apiKeysService.validateKey!.mockResolvedValue(mockUser);

    const context = createMockContext({ authorization: 'Bearer ord_live_token123' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(apiKeysService.validateKey).toHaveBeenCalledWith('ord_live_token123');
    expect((context.switchToHttp().getRequest() as any).user).toEqual(mockUser);
  });

  it('should authenticate with x-api-key header', async () => {
    const mockUser = { id: 2, rubberHandle: 'agent2' } as any;
    apiKeysService.validateKey!.mockResolvedValue(mockUser);

    const context = createMockContext({ 'x-api-key': 'ord_live_xkey456' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(apiKeysService.validateKey).toHaveBeenCalledWith('ord_live_xkey456');
  });

  it('should authenticate with query token parameter', async () => {
    const mockUser = { id: 3, rubberHandle: 'agent3' } as any;
    apiKeysService.validateKey!.mockResolvedValue(mockUser);

    const context = createMockContext({}, { token: 'ord_live_querytoken789' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(apiKeysService.validateKey).toHaveBeenCalledWith('ord_live_querytoken789');
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
