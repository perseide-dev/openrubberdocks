import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
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
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { TasksService } from '@moduleProjects/services/tasks.service';
import { CreateTaskDto } from '@moduleProjects/dto/create-task.dto';
import { UpdateTaskDto } from '@moduleProjects/dto/update-task.dto';
import { MoveTaskDto } from '@moduleProjects/dto/move-task.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller()
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @UseInterceptors(new JsonApiInterceptor('tasks'))
    @Post('projects/:projectUuid/tasks')
    @RequirePermissions('task:create')
    create(
        @Param('projectUuid') projectUuid: string,
        @JsonApiBody() dto: CreateTaskDto,
        @Req() request: Request,
    ) {
        const user = request.user as any;
        return this.tasksService.create(projectUuid, dto, user?.uuid);
    }

    @UseInterceptors(new JsonApiInterceptor('tasks'))
    @Get('projects/:projectUuid/tasks')
    @RequirePermissions('task:read')
    findAll(@Param('projectUuid') projectUuid: string) {
        return this.tasksService.findAll(projectUuid);
    }

    @UseInterceptors(new JsonApiInterceptor('tasks'))
    @Get('tasks/:taskUuid')
    @RequirePermissions('task:read')
    findOne(@Param('taskUuid') taskUuid: string) {
        return this.tasksService.findOne(taskUuid);
    }

    @UseInterceptors(new JsonApiInterceptor('tasks'))
    @Patch('tasks/:taskUuid')
    @RequirePermissions('task:update')
    update(
        @Param('taskUuid') taskUuid: string,
        @JsonApiBody() dto: UpdateTaskDto,
    ) {
        return this.tasksService.update(taskUuid, dto);
    }

    @UseInterceptors(new JsonApiInterceptor('tasks'))
    @Patch('tasks/:taskUuid/move')
    @RequirePermissions('task:update')
    move(
        @Param('taskUuid') taskUuid: string,
        @JsonApiBody() dto: MoveTaskDto,
    ) {
        return this.tasksService.move(taskUuid, dto);
    }

    @Delete('tasks/:taskUuid')
    @RequirePermissions('task:delete')
    remove(@Param('taskUuid') taskUuid: string) {
        return this.tasksService.delete(taskUuid);
    }
}
