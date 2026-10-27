import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('increment')
  @Exclude()
  id: number;

  @Index('IDX_audit_logs_uuid', { unique: true })
  @Column({ name: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Index('IDX_audit_logs_user_id')
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'user_email', type: 'varchar', length: 255, nullable: true })
  userEmail: string | null;

  @Column({ name: 'user_type', type: 'varchar', length: 50, nullable: true })
  userType: string | null;

  @Index('IDX_audit_logs_action')
  @Column({ name: 'action', type: 'varchar', length: 100 })
  action: string;

  @Index('IDX_audit_logs_resource_type')
  @Column({ name: 'resource_type', type: 'varchar', length: 50 })
  resourceType: string;

  @Column({ name: 'resource_uuid', type: 'varchar', length: 100, nullable: true })
  resourceUuid: string | null;

  @Index('IDX_audit_logs_workspace_uuid')
  @Column({ name: 'workspace_uuid', type: 'varchar', length: 100, nullable: true })
  workspaceUuid: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: 'SUCCESS' | 'FAILURE';

  @Column({ name: 'status_code', type: 'int' })
  statusCode: number;

  @Column({ name: 'execution_time_ms', type: 'int', default: 0 })
  executionTimeMs: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'payload', type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Index('IDX_audit_logs_created_at')
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
