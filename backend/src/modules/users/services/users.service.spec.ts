import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserType } from '../enums/users.enum';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createDto = { rubberHandle: 'test', username: 'Test', type: UserType.INTERNAL, password: 'pwd' };
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createDto);
      repository.save.mockResolvedValue(createDto);

      const result = await service.create(createDto);
      expect(result).toEqual(createDto);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createDto = { rubberHandle: 'test', username: 'Test', type: UserType.INTERNAL, password: 'pwd' };
      repository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if core admin already exists', async () => {
      const createDto = { rubberHandle: 'test', username: 'Test', type: UserType.COREADMIN, password: 'pwd' };
      // first call checks for existing user (mock to null)
      // second call checks for existing core admin (mock to existing)
      repository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByRubberHandle', () => {
    it('should return a user if found', async () => {
      const mockUser = { rubberHandle: 'test' };
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByRubberHandle('test');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByRubberHandle('test')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { uuid: 'u-1' };
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('u-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('u-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token', async () => {
      await service.updateRefreshToken('u-1', 'new-token');
      expect(repository.update).toHaveBeenCalledWith({ uuid: 'u-1' }, { hashedRefreshToken: 'new-token' });
    });
  });
});
