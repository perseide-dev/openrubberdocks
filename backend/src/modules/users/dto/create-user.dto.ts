import { IsString, IsNotEmpty, MinLength, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { UserType } from '@moduleUsers/enums/users.enum';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    readonly username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    readonly rubberHandle: string;

    @IsEnum(UserType)
    @IsNotEmpty()
    readonly type: UserType;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    readonly password: string;

    @IsUUID()
    @IsOptional()
    readonly initialRoleUuid?: string;
}