import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsUUID,
    IsDateString,
} from 'class-validator';

export class CreateProjectDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    coverImage?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsNotEmpty()
    @IsUUID()
    workspaceUuid: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    targetDate?: string;
}
