import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from '@moduleAuth/entities/api-key.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { CreateApiKeyDto } from '@moduleAuth/dto/create-api-key.dto';
import { AUTH_ERRORS_CONSTANTS } from '@moduleAuth/constants/auth.errors.constants';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createApiKey(
    userId: number,
    createDto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const randomPart = crypto.randomBytes(24).toString('hex');
    const rawKey = `ord_live_${randomPart}`;
    const keyPrefix = rawKey.substring(0, 14);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    let expiresAt: Date | null = null;
    if (createDto.expiresInDays && createDto.expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + createDto.expiresInDays);
    }

    const apiKey = this.apiKeyRepository.create({
      name: createDto.name,
      keyHash,
      keyPrefix,
      expiresAt,
      isActive: true,
      user,
    });

    const savedKey = await this.apiKeyRepository.save(apiKey);

    return {
      apiKey: savedKey,
      rawKey,
    };
  }

  async validateKey(rawKey: string): Promise<User> {
    if (!rawKey || typeof rawKey !== 'string' || !rawKey.startsWith('ord_live_')) {
      throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.INVALID_API_KEY());
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.apiKeyRepository.findOne({
      where: { keyHash },
      relations: [
        'user',
        'user.scopes',
        'user.scopes.role',
        'user.scopes.role.permissions',
        'user.scopes.workspace',
      ],
    });

    if (!apiKey || !apiKey.isActive) {
      throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.INVALID_API_KEY());
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException(AUTH_ERRORS_CONSTANTS.EXPIRED_API_KEY());
    }

    // Update lastUsedAt asynchronously
    apiKey.lastUsedAt = new Date();
    await this.apiKeyRepository.save(apiKey);

    return apiKey.user;
  }

  async listKeysForUser(userId: number): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeKey(uuid: string, userId?: number): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });

    if (!apiKey) {
      throw new NotFoundException(AUTH_ERRORS_CONSTANTS.API_KEY_NOT_FOUND());
    }

    if (userId !== undefined && apiKey.user.id !== userId) {
      throw new ForbiddenException(AUTH_ERRORS_CONSTANTS.UNAUTHORIZED_ACCESS());
    }

    apiKey.isActive = false;
    return this.apiKeyRepository.save(apiKey);
  }

  async deleteKey(uuid: string, userId?: number): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });

    if (!apiKey) {
      throw new NotFoundException(AUTH_ERRORS_CONSTANTS.API_KEY_NOT_FOUND());
    }

    if (userId !== undefined && apiKey.user.id !== userId) {
      throw new ForbiddenException(AUTH_ERRORS_CONSTANTS.UNAUTHORIZED_ACCESS());
    }

    await this.apiKeyRepository.remove(apiKey);
  }
}
