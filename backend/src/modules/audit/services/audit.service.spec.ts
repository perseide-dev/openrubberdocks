import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuditService } from '@moduleAudit/services/audit.service';
import { AuditLog } from '@moduleAudit/entities/audit-log.entity';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

describe('AuditService', () => {
  let service: AuditService;
  let mockRepo: any;
  let mockAcl: any;

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockImplementation((val) => val),
      save: jest.fn().mockResolvedValue({ id: 1 }),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockAcl = {
      hasPermission: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepo,
        },
        {
          provide: AccessControlService,
          useValue: mockAcl,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logEvent', () => {
    it('should create and save an audit log record safely', async () => {
      await service.logEvent({
        action: 'WORKSPACE_CREATE',
        resourceType: 'workspace',
        status: 'SUCCESS',
        statusCode: 201,
        userEmail: 'admin@rubberdocks.io',
      });

      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should catch errors without rethrowing to keep application non-blocking', async () => {
      mockRepo.save.mockRejectedValueOnce(new Error('DB disconnect'));

      await expect(
        service.logEvent({
          action: 'FAIL_ACTION',
          resourceType: 'test',
          status: 'FAILURE',
          statusCode: 500,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should throw ForbiddenException if user lacks global:audit and does not provide workspaceUuid', async () => {
      mockAcl.hasPermission.mockResolvedValue(false);

      await expect(
        service.findAll({ page: 1, limit: 10 }, { id: 2, type: 'internal' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow access if user has global:audit', async () => {
      mockAcl.hasPermission.mockResolvedValue(true);
      const qbMock: any = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(qbMock);

      const result = await service.findAll(
        { page: 1, limit: 10 },
        { id: 1, type: 'internal' },
      );

      expect(result).toEqual([]);
    });
  });
});
