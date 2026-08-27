import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateFileDto {
    @IsUUID()
    @IsOptional()
    parentPageUuid?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsString()
    @IsOptional()
    coverImage?: string;

    @IsBoolean()
    @IsOptional()
    isTemplate?: boolean;
}
