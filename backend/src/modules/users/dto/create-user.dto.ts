import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { UserType } from '@moduleUsers/enums/users.enum';

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    readonly username: string;

    @IsString()
    @IsNotEmpty()
    readonly rubberHandle: string;

    @IsEnum(UserType)
    @IsNotEmpty()
    readonly type: UserType;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    readonly password: string;

}