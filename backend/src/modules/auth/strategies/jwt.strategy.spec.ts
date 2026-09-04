import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '@moduleUsers/services/users.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
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
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user if found', async () => {
    const mockUser = { id: 1 };
    usersService.findById.mockResolvedValue(mockUser);

    const result = await strategy.validate({ userUUID: 'u-1' });
    expect(result).toEqual(mockUser);
  });

  it('should throw UnauthorizedException if user not found', async () => {
    usersService.findById.mockResolvedValue(null);
    await expect(strategy.validate({ userUUID: 'u-1' })).rejects.toThrow(UnauthorizedException);
  });
});
