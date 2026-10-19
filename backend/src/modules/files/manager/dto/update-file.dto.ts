import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateFileDto {
    @IsUUID()
    @IsOptional()
    parentPageUuid?: string | null;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    icon?: string | null;

    @IsString()
    @IsOptional()
    coverImage?: string | null;

    @IsBoolean()
    @IsOptional()
    isTemplate?: boolean;
}
