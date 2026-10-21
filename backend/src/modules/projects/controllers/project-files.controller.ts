import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { TaskConfigurationService } from '@moduleProjects/services/task-configuration.service';
import { LinkProjectFileDto } from '@moduleProjects/dto/link-project-file.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('projects/:projectUuid/files')
export class ProjectFilesController {
    constructor(private readonly configService: TaskConfigurationService) {}

    @UseInterceptors(new JsonApiInterceptor('project_file_links'))
    @Get()
    @RequirePermissions('project:read')
    findLinkedFiles(@Param('projectUuid') projectUuid: string) {
        return this.configService.findLinkedFiles(projectUuid);
    }

    @UseInterceptors(new JsonApiInterceptor('project_file_links'))
    @Post()
    @RequirePermissions('project:update')
    linkFile(
        @Param('projectUuid') projectUuid: string,
        @JsonApiBody() dto: LinkProjectFileDto,
    ) {
        return this.configService.linkFile(projectUuid, dto.fileUuid);
    }

    @Delete(':fileUuid')
    @RequirePermissions('project:update')
    unlinkFile(
        @Param('projectUuid') projectUuid: string,
        @Param('fileUuid') fileUuid: string,
    ) {
        return this.configService.unlinkFile(projectUuid, fileUuid);
    }
}
