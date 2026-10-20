import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsUUID()
  @IsNotEmpty()
  roleUuid: string;
}
