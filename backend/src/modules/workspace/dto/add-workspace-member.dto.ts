import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddWorkspaceMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userUuid: string;

  @IsUUID()
  @IsNotEmpty()
  roleUuid: string;
}
