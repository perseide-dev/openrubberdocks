import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateFileDto {
    @IsUUID()
    workspace_id: string;

    @IsUUID()
    @IsOptional()
    parent_page_id?: string;

    @IsString()
    title: string;

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
