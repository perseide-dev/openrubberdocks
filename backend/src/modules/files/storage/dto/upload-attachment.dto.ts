import { IsOptional, IsUUID } from 'class-validator';

export class UploadAttachmentDto {
    @IsUUID()
    workspaceUuid: string;

    @IsUUID()
    @IsOptional()
    fileUuid?: string;
}
