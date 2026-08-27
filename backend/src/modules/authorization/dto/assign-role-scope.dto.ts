import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AssignRoleScopeDto {
  @IsUUID('4')
  @IsNotEmpty()
  userUuid: string;

  @IsUUID('4')
  @IsNotEmpty()
  roleUuid: string;

  @IsUUID('4')
  @IsOptional()
  workspaceUuid?: string;

  @IsUUID('4')
  @IsOptional()
  squadUuid?: string;
}
