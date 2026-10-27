import { IsString, IsNotEmpty, MinLength } from 'class-validator';


export class ValidateUserDTO {

    @IsString()
    @IsNotEmpty()
    readonly rubberHandle: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    readonly pwd: string;

}