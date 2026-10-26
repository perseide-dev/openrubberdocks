import { IsString, IsNotEmpty, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreateAuditLogDto {
  @IsInt()
  @IsOptional()
  userId?: number | null;

  @IsString()
  @IsOptional()
  userEmail?: string | null;

  @IsString()
  @IsOptional()
  userType?: string | null;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  resourceType: string;

  @IsString()
  @IsOptional()
  resourceUuid?: string | null;

  @IsString()
  @IsOptional()
  workspaceUuid?: string | null;

  @IsIn(['SUCCESS', 'FAILURE'])
  status: 'SUCCESS' | 'FAILURE';

  @IsInt()
  statusCode: number;

  @IsInt()
  @IsOptional()
  executionTimeMs?: number;

  @IsString()
  @IsOptional()
  ipAddress?: string | null;

  @IsString()
  @IsOptional()
  userAgent?: string | null;

  @IsOptional()
  payload?: Record<string, any> | null;

  @IsString()
  @IsOptional()
  errorMessage?: string | null;
}
