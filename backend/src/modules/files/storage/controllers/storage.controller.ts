import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { StorageService } from '@moduleFiles/storage/services/storage.service';
import { UploadAttachmentDto } from '@moduleFiles/storage/dto/upload-attachment.dto';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { CheckScope } from '@commonDecorators/check-scope.decorator';
import { PermissionsGuard } from '@commonGuards/permissions.guard';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) {}

    @Post('upload')
    @RequirePermissions('document:write')
    @CheckScope('workspaceUuid')
    @UseInterceptors(
        FileInterceptor('file'),
        new JsonApiInterceptor('storage-attachments'),
    )
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadAttachmentDto,
        @Req() req: Request,
    ) {
        return await this.storageService.uploadAttachment(file, dto, req.user);
    }

    @Get('quota/:workspaceUuid')
    @RequirePermissions('document:read')
    @CheckScope('workspaceUuid')
    @UseInterceptors(new JsonApiInterceptor('storage-quotas'))
    async getQuota(
        @Param('workspaceUuid') workspaceUuid: string,
        @Req() req: Request,
    ) {
        return await this.storageService.getWorkspaceQuotaStatus(workspaceUuid, req.user);
    }

    @Get('workspace/:workspaceUuid')
    @RequirePermissions('document:read')
    @CheckScope('workspaceUuid')
    @UseInterceptors(new JsonApiInterceptor('storage-attachments'))
    async listByWorkspace(
        @Param('workspaceUuid') workspaceUuid: string,
        @Req() req: Request,
    ) {
        return await this.storageService.listWorkspaceAttachments(workspaceUuid, req.user);
    }

    @Get('attachments/:uuid/content')
    async streamContent(
        @Param('uuid') uuid: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const { attachment, streamResult } = await this.storageService.getAttachmentWithStream(
            uuid,
            req.user,
        );

        const safeFilename = attachment.originalName.replace(/["\\\r\n]/g, '_');
        const isInlineSafe =
            attachment.mimeType.startsWith('image/') ||
            attachment.mimeType === 'application/pdf' ||
            attachment.mimeType.startsWith('text/');

        res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader(
            'Content-Disposition',
            `${isInlineSafe ? 'inline' : 'attachment'}; filename="${safeFilename}"`,
        );
        res.setHeader('Cache-Control', 'private, max-age=3600');
        if (streamResult.contentLength ?? attachment.sizeBytes) {
            res.setHeader(
                'Content-Length',
                String(streamResult.contentLength ?? attachment.sizeBytes),
            );
        }

        streamResult.stream.pipe(res);
    }

    @Delete('attachments/:uuid')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('uuid') uuid: string, @Req() req: Request) {
        await this.storageService.removeAttachment(uuid, req.user);
    }
}
