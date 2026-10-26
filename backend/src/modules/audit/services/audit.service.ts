import {
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@moduleAudit/entities/audit-log.entity';
import { CreateAuditLogDto } from '@moduleAudit/dto/create-audit-log.dto';
import { QueryAuditLogDto } from '@moduleAudit/dto/query-audit-log.dto';
import { AccessControlService } from '@moduleAuthorization/services/access-control.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly accessControlService: AccessControlService,
  ) {}

  /**
   * Asynchronously records an audit event without blocking or throwing.
   */
  async logEvent(dto: CreateAuditLogDto): Promise<void> {
    try {
      const record = this.auditLogRepository.create({
        userId: dto.userId ?? null,
        userEmail: dto.userEmail ?? null,
        userType: dto.userType ?? null,
        action: dto.action,
        resourceType: dto.resourceType,
        resourceUuid: dto.resourceUuid ?? null,
        workspaceUuid: dto.workspaceUuid ?? null,
        status: dto.status,
        statusCode: dto.statusCode,
        executionTimeMs: dto.executionTimeMs ?? 0,
        ipAddress: dto.ipAddress ?? null,
        userAgent: dto.userAgent ?? null,
        payload: dto.payload ?? null,
        errorMessage: dto.errorMessage ?? null,
      });

      await this.auditLogRepository.save(record);
    } catch (error) {
      this.logger.error(
        `Failed to persist audit log: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Retrieves paginated audit logs filtered by scope and metadata.
   */
  async findAll(query: QueryAuditLogDto, currentUser: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const isCoreAdmin = currentUser?.type === 'coreAdmin';
    const hasGlobalAudit =
      isCoreAdmin ||
      (await this.accessControlService.hasPermission(currentUser.id, 'global:audit'));

    const qb = this.auditLogRepository.createQueryBuilder('log');

    if (!hasGlobalAudit) {
      if (!query.workspaceUuid) {
        throw new ForbiddenException(
          'Scope violation: workspaceUuid query parameter is required without global:audit permission',
        );
      }

      const hasWorkspaceAudit = await this.accessControlService.hasPermission(
        currentUser.id,
        'workspace:audit',
        query.workspaceUuid,
      );

      if (!hasWorkspaceAudit) {
        throw new ForbiddenException(
          `Missing permission: workspace:audit for workspace ${query.workspaceUuid}`,
        );
      }

      qb.andWhere('log.workspace_uuid = :wsUuid', { wsUuid: query.workspaceUuid });
    } else if (query.workspaceUuid) {
      qb.andWhere('log.workspace_uuid = :wsUuid', { wsUuid: query.workspaceUuid });
    }

    if (query.action) {
      qb.andWhere('LOWER(log.action) LIKE LOWER(:action)', { action: `%${query.action}%` });
    }

    if (query.resourceType) {
      qb.andWhere('LOWER(log.resource_type) = LOWER(:resType)', {
        resType: query.resourceType,
      });
    }

    if (query.status) {
      qb.andWhere('log.status = :status', { status: query.status });
    }

    if (query.userId) {
      qb.andWhere('log.user_id = :userId', { userId: query.userId });
    }

    if (query.from) {
      const fromDate = new Date(query.from);
      if (!isNaN(fromDate.getTime())) {
        qb.andWhere('log.created_at >= :from', { from: fromDate });
      }
    }

    if (query.to) {
      const toDate = new Date(query.to);
      if (!isNaN(toDate.getTime())) {
        qb.andWhere('log.created_at <= :to', { to: toDate });
      }
    }

    qb.orderBy('log.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getMany();
  }

  /**
   * Retrieves a single audit log entry by UUID with RBAC verification.
   */
  async findOne(uuid: string, currentUser: any): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({ where: { uuid } });
    if (!log) {
      throw new NotFoundException(`Audit log entry with UUID ${uuid} not found`);
    }

    const isCoreAdmin = currentUser?.type === 'coreAdmin';
    const hasGlobalAudit =
      isCoreAdmin ||
      (await this.accessControlService.hasPermission(currentUser.id, 'global:audit'));

    if (!hasGlobalAudit) {
      if (!log.workspaceUuid) {
        throw new ForbiddenException('Cannot access global audit log without global:audit permission');
      }

      const hasWorkspaceAudit = await this.accessControlService.hasPermission(
        currentUser.id,
        'workspace:audit',
        log.workspaceUuid,
      );

      if (!hasWorkspaceAudit) {
        throw new ForbiddenException('Missing permission: workspace:audit for this log entry');
      }
    }

    return log;
  }
}
