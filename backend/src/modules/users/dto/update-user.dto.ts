import { IsString, MinLength, IsEnum, IsUUID, IsOptional, ValidateIf, IsBoolean } from 'class-validator';
import { UserType } from '@moduleUsers/enums/users.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  readonly username?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  readonly rubberHandle?: string;

  @IsEnum(UserType)
  @IsOptional()
  readonly type?: UserType;

  @IsString()
  @IsOptional()
  @MinLength(8)
  readonly password?: string;

  @ValidateIf((_, value) => value !== null && value !== '')
  @IsUUID()
  @IsOptional()
  readonly globalRoleUuid?: string | null;

  @IsBoolean()
  @IsOptional()
  readonly canViewDocuments?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly canViewProjects?: boolean;
}
