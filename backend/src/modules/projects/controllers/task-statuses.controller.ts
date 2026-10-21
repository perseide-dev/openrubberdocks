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
import { CreateTaskStatusDto } from '@moduleProjects/dto/create-task-status.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('projects/:projectUuid/statuses')
export class TaskStatusesController {
    constructor(private readonly configService: TaskConfigurationService) {}

    @UseInterceptors(new JsonApiInterceptor('task_statuses'))
    @Get()
    @RequirePermissions('project:read')
    findAll(@Param('projectUuid') projectUuid: string) {
        return this.configService.findStatuses(projectUuid);
    }

    @UseInterceptors(new JsonApiInterceptor('task_statuses'))
    @Post()
    @RequirePermissions('task_status:manage')
    create(
        @Param('projectUuid') projectUuid: string,
        @JsonApiBody() dto: CreateTaskStatusDto,
    ) {
        return this.configService.createStatus(projectUuid, dto);
    }

    @Delete(':statusUuid')
    @RequirePermissions('task_status:manage')
    remove(
        @Param('projectUuid') projectUuid: string,
        @Param('statusUuid') statusUuid: string,
    ) {
        return this.configService.deleteStatus(projectUuid, statusUuid);
    }
}
