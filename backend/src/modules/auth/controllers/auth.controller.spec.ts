import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { HttpStatus } from '@nestjs/common';
import type { Response, Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      validateUser: jest.fn(),
      generateTokens: jest.fn(),
      updateRefreshToken: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    })
    .overrideGuard(AuthGuard('jwt')).useValue({ canActivate: () => true })
    .overrideGuard(AuthGuard('jwt-refresh')).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should set cookies and return user if credentials are valid', async () => {
      const mockUser = { uuid: 'u-1', email: 'test@test.com' };
      authService.validateUser.mockResolvedValue(mockUser);
      authService.generateTokens.mockResolvedValue({ accessToken: 'acc_token', refreshToken: 'ref_token' });

      const mockResponse = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const result = await controller.login({ rubberHanlde: 'test', pwd: 'pwd' }, mockResponse);

      expect(authService.generateTokens).toHaveBeenCalled();
      expect(authService.updateRefreshToken).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUser);
    });

    it('should return 401 if user is invalid', async () => {
      authService.validateUser.mockResolvedValue(null);

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const result = await controller.login({ rubberHanlde: 'test', pwd: 'pwd' }, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(result).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('should set new cookies and return user', async () => {
      const mockUser = { userUUID: 'u-1' };
      const mockRequest = { user: mockUser } as unknown as Request;
      const mockResponse = { cookie: jest.fn() } as unknown as Response;

      authService.refreshTokens.mockResolvedValue({ accessToken: 'new_acc', refreshToken: 'new_ref' });

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(authService.refreshTokens).toHaveBeenCalled();
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear cookies and call logout service', async () => {
      const mockRequest = { user: { uuid: 'u-1' } } as unknown as Request;
      const mockResponse = { clearCookie: jest.fn() } as unknown as Response;

      const result = await controller.logout(mockRequest, mockResponse);

      expect(authService.logout).toHaveBeenCalledWith('u-1');
      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return req.user', () => {
      const mockRequest = { user: { id: 1 } } as unknown as Request;
      expect(controller.getProfile(mockRequest)).toEqual({ id: 1 });
    });
  });
});
