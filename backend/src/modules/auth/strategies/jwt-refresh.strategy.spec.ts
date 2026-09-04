import { Test, TestingModule } from '@nestjs/testing';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { UsersService } from '@moduleUsers/services/users.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
    };

    const configService = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should throw UnauthorizedException if refresh token is not in cookies', async () => {
    const mockRequest = { cookies: {} } as Request;
    await expect(strategy.validate(mockRequest, { userUUID: 'u-1' })).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user not found', async () => {
    const mockRequest = { cookies: { Refresh: 'token' } } as Request;
    usersService.findById.mockResolvedValue(null);
    await expect(strategy.validate(mockRequest, { userUUID: 'u-1' })).rejects.toThrow(UnauthorizedException);
  });

  it('should return user with refreshToken if valid', async () => {
    const mockRequest = { cookies: { Refresh: 'token' } } as Request;
    const mockUser = { id: 1 };
    usersService.findById.mockResolvedValue(mockUser);

    const result = await strategy.validate(mockRequest, { userUUID: 'u-1' });
    expect(result).toEqual({ ...mockUser, refreshToken: 'token' });
  });
});
