import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { SCOPE_KEY } from '../decorators/check-scope.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;
  let accessControlService: jest.Mocked<AccessControlService>;

  beforeEach(async () => {
    const reflectorMock = {
      getAllAndOverride: jest.fn(),
    };

    const accessControlServiceMock = {
      hasPermission: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        { provide: Reflector, useValue: reflectorMock },
        { provide: AccessControlService, useValue: accessControlServiceMock },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get(Reflector);
    accessControlService = module.get(AccessControlService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no permissions are required', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is not authenticated properly', async () => {
    reflector.getAllAndOverride.mockReturnValue(['some:permission']);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: null }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow('User not authenticated properly');
  });

  it('should throw ForbiddenException if user lacks required permission', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return ['test:permission'];
      if (key === SCOPE_KEY) return undefined;
    });

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { id: 'user-1' }, params: {} }),
      }),
    } as unknown as ExecutionContext;

    accessControlService.hasPermission.mockResolvedValue(false);

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow('Missing permission: test:permission in the current scope');
  });

  it('should return true if user has required permissions globally', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return ['test:permission'];
      if (key === SCOPE_KEY) return undefined;
    });

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: { id: 'user-1' }, params: {} }),
      }),
    } as unknown as ExecutionContext;

    accessControlService.hasPermission.mockResolvedValue(true);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(accessControlService.hasPermission).toHaveBeenCalledWith('user-1', 'test:permission', undefined);
  });

  it('should return true if user has required permissions in a specific workspace scope', async () => {
    reflector.getAllAndOverride.mockImplementation((key) => {
      if (key === PERMISSIONS_KEY) return ['test:permission'];
      if (key === SCOPE_KEY) return 'workspaceId';
    });

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ 
          user: { id: 'user-1' },
          params: { workspaceId: 'ws-123' } 
        }),
      }),
    } as unknown as ExecutionContext;

    accessControlService.hasPermission.mockResolvedValue(true);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(accessControlService.hasPermission).toHaveBeenCalledWith('user-1', 'test:permission', 'ws-123');
  });
});
