import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    UseInterceptors,
    Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { FileRevisionsService } from '@moduleFiles/manager/services/file-revisions.service';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('files/:uuid/revisions')
export class FileRevisionsController {
    constructor(private readonly fileRevisionsService: FileRevisionsService) {}

    @UseInterceptors(new JsonApiInterceptor('file_revisions'))
    @Get()
    @RequirePermissions('document:read')
    findAll(@Param('uuid') uuid: string) {
        return this.fileRevisionsService.findAllRevisions(uuid);
    }

    @UseInterceptors(new JsonApiInterceptor('file_revisions'))
    @Get(':revisionUuid')
    @RequirePermissions('document:read')
    findOne(
        @Param('uuid') uuid: string,
        @Param('revisionUuid') revisionUuid: string,
    ) {
        return this.fileRevisionsService.findOneRevision(uuid, revisionUuid);
    }

    @UseInterceptors(new JsonApiInterceptor('file_revisions'))
    @Post()
    @RequirePermissions('document:write')
    createSnapshot(
        @Param('uuid') uuid: string,
        @Req() request: Request,
    ) {
        const user = request.user as any;
        return this.fileRevisionsService.createSnapshot(uuid, user?.uuid);
    }

    @UseInterceptors(new JsonApiInterceptor('pages'))
    @Post(':revisionUuid/restore')
    @RequirePermissions('document:write')
    restore(
        @Param('uuid') uuid: string,
        @Param('revisionUuid') revisionUuid: string,
        @Req() request: Request,
    ) {
        const user = request.user as any;
        return this.fileRevisionsService.restoreRevision(uuid, revisionUuid, user?.uuid);
    }
}
