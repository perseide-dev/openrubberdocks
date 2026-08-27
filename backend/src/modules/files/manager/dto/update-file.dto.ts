import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateFileDto {
    @IsUUID()
    @IsOptional()
    parent_page_id?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsString()
    @IsOptional()
    cover_image?: string;

    @IsBoolean()
    @IsOptional()
    is_template?: boolean;
}
