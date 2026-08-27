import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionUuids?: string[];
}
