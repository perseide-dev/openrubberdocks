import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateFileDto {
    @IsUUID()
    workspaceUuid: string;

    @IsUUID()
    @IsOptional()
    parentPageUuid?: string;

    @IsString()
    title: string;

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
