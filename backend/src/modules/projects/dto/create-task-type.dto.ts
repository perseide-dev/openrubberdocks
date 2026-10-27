import {
    IsNotEmpty,
    IsString,
    IsOptional,
} from 'class-validator';

export class CreateTaskTypeDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    color?: string;
}
