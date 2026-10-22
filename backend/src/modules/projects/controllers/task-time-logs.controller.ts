import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    UseInterceptors,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { TaskTimeLogsService } from '@moduleProjects/services/task-time-logs.service';
import { CreateTaskTimeLogDto } from '@moduleProjects/dto/create-task-time-log.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('tasks/:taskUuid/time-logs')
export class TaskTimeLogsController {
    constructor(private readonly timeLogsService: TaskTimeLogsService) {}

    @UseInterceptors(new JsonApiInterceptor('task_time_logs'))
    @Post()
    @RequirePermissions('task:time_log')
    create(
        @Param('taskUuid') taskUuid: string,
        @JsonApiBody() dto: CreateTaskTimeLogDto,
        @Req() request: Request,
    ) {
        const user = request.user as any;
        return this.timeLogsService.create(taskUuid, dto, user?.uuid);
    }

    @UseInterceptors(new JsonApiInterceptor('task_time_logs'))
    @Get()
    @RequirePermissions('task:read')
    findAll(@Param('taskUuid') taskUuid: string) {
        return this.timeLogsService.findAll(taskUuid);
    }

    @Delete(':logUuid')
    @HttpCode(HttpStatus.NO_CONTENT)
    @RequirePermissions('task:time_log')
    remove(
        @Param('taskUuid') taskUuid: string,
        @Param('logUuid') logUuid: string,
    ) {
        return this.timeLogsService.delete(taskUuid, logUuid);
    }
}
