import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuditService } from '@moduleAudit/services/audit.service';
import { QueryAuditLogDto } from '@moduleAudit/dto/query-audit-log.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { SkipAudit } from '@moduleAudit/decorators/skip-audit.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('audit-logs')
@SkipAudit()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @UseInterceptors(new JsonApiInterceptor('audit_logs'))
  @Get()
  async findAll(@Query() query: QueryAuditLogDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.auditService.findAll(query, user);
  }

  @UseInterceptors(new JsonApiInterceptor('audit_logs'))
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.auditService.findOne(uuid, user);
  }
}
