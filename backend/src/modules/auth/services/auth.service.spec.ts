import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@moduleUsers/services/users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;
  let configService: any;

  beforeEach(async () => {
    usersService = {
      findByRubberHandle: jest.fn(),
      findById: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    configService = {
      getOrThrow: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = { id: 1, password: 'hashedpassword' };
      usersService.findByRubberHandle.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser({ rubberHanlde: 'test', pwd: 'password' });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      usersService.findByRubberHandle.mockResolvedValue({ id: 1, password: 'hashedpassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser({ rubberHanlde: 'test', pwd: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      configService.getOrThrow.mockImplementation((key) => {
        if (key === 'JWT_ACCESS_SECRET') return 'access_secret';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
      });

      jwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      const result = await service.generateTokens({ userUUID: 'uuid' } as any);
      
      expect(result).toEqual({ accessToken: 'access_token', refreshToken: 'refresh_token' });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateRefreshToken', () => {
    it('should hash token and call usersService', async () => {
      configService.get.mockReturnValue(12);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_token');

      await service.updateRefreshToken({ userUUID: 'u-1', refreshToken: 'token' });

      expect(bcrypt.hash).toHaveBeenCalledWith('token', 'salt');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('u-1', 'hashed_token');
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const mockUser = { uuid: 'u-1', hashedRefreshToken: 'hashed_token' };
      usersService.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock generateTokens
      jest.spyOn(service, 'generateTokens').mockResolvedValue({ accessToken: 'new_acc', refreshToken: 'new_ref' });
      jest.spyOn(service, 'updateRefreshToken').mockResolvedValue(undefined);

      const result = await service.refreshTokens({ userUUID: 'u-1', refreshToken: 'token' });
      
      expect(result).toEqual({ accessToken: 'new_acc', refreshToken: 'new_ref' });
      expect(service.generateTokens).toHaveBeenCalled();
      expect(service.updateRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);
      await expect(service.refreshTokens({ userUUID: 'u-1', refreshToken: 'token' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      usersService.findById.mockResolvedValue({ uuid: 'u-1', hashedRefreshToken: 'hashed_token' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.refreshTokens({ userUUID: 'u-1', refreshToken: 'token' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      await service.logout('u-1');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith('u-1', null);
    });
  });
});
