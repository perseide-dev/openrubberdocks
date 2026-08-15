import { IsString, minLength, isNotEmpty, isString, Min, MinLength } from "class-validator";


export class ValidateUserDto{

    @IsString()
    @MinLength(8)
    rubberHanlde:string;

    @IsString()
    @MinLength(8)
    password: string;

}