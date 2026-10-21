import {
    IsNotEmpty,
    IsInt,
    Min,
    IsOptional,
    IsString,
    IsDateString,
} from 'class-validator';

export class CreateTaskTimeLogDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    minutes: number;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
