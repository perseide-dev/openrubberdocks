import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ApiKeysService } from '@moduleAuth/services/api-keys.service';
import { ApiKey } from '@moduleAuth/entities/api-key.entity';
import { User } from '@moduleUsers/entities/user.entity';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let apiKeyRepository: any;
  let userRepository: any;

  beforeEach(async () => {
    apiKeyRepository = {
      create: jest.fn((dto) => ({ ...dto, id: 1, uuid: 'key-uuid-1' })),
      save: jest.fn((entity) => Promise.resolve(entity)),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: apiKeyRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApiKey', () => {
    it('should create and return raw key and entity', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.createApiKey(1, {
        name: 'Agent Key',
        expiresInDays: 30,
      });

      expect(result.rawKey).toMatch(/^ord_live_[a-f0-9]{48}$/);
      expect(result.apiKey.name).toBe('Agent Key');
      expect(result.apiKey.isActive).toBe(true);
      expect(result.apiKey.expiresAt).toBeDefined();
      expect(apiKeyRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createApiKey(999, { name: 'Agent Key' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateKey', () => {
    it('should throw UnauthorizedException if key prefix is invalid', async () => {
      await expect(service.validateKey('invalid_key')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if key not found', async () => {
      apiKeyRepository.findOne.mockResolvedValue(null);
      await expect(service.validateKey('ord_live_12345678901234567890123456789012')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if key is inactive', async () => {
      apiKeyRepository.findOne.mockResolvedValue({
        id: 1,
        isActive: false,
        expiresAt: null,
      });

      await expect(service.validateKey('ord_live_12345678901234567890123456789012')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if key is expired', async () => {
      const pastDate = new Date(Date.now() - 100000);
      apiKeyRepository.findOne.mockResolvedValue({
        id: 1,
        isActive: true,
        expiresAt: pastDate,
      });

      await expect(service.validateKey('ord_live_12345678901234567890123456789012')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should validate key, update lastUsedAt, and return user', async () => {
      const mockUser = { id: 1, rubberHandle: 'agentUser' };
      const mockApiKey = {
        id: 1,
        isActive: true,
        expiresAt: null,
        user: mockUser,
        lastUsedAt: null,
      };

      apiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.validateKey('ord_live_12345678901234567890123456789012');
      expect(result).toEqual(mockUser);
      expect(mockApiKey.lastUsedAt).toBeDefined();
      expect(apiKeyRepository.save).toHaveBeenCalledWith(mockApiKey);
    });
  });

  describe('revokeKey', () => {
    it('should deactivate an API key', async () => {
      const mockKey = {
        id: 1,
        uuid: 'k-1',
        isActive: true,
        user: { id: 10 },
      };
      apiKeyRepository.findOne.mockResolvedValue(mockKey);

      await service.revokeKey('k-1', 10);
      expect(mockKey.isActive).toBe(false);
      expect(apiKeyRepository.save).toHaveBeenCalledWith(mockKey);
    });

    it('should throw ForbiddenException if user does not own the key', async () => {
      const mockKey = {
        id: 1,
        uuid: 'k-1',
        isActive: true,
        user: { id: 10 },
      };
      apiKeyRepository.findOne.mockResolvedValue(mockKey);

      await expect(service.revokeKey('k-1', 99)).rejects.toThrow(ForbiddenException);
    });
  });
});
