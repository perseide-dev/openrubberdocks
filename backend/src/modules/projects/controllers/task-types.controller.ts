import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    UseInterceptors,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '@commonGuards/permissions.guard';
import { RequirePermissions } from '@commonDecorators/require-permissions.decorator';
import { JsonApiInterceptor } from '@commonInterceptors/json-api.interceptor';
import { JsonApiBody } from '@commonDecorators/json-api-body.decorator';
import { TaskConfigurationService } from '@moduleProjects/services/task-configuration.service';
import { CreateTaskTypeDto } from '@moduleProjects/dto/create-task-type.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('projects/:projectUuid/types')
export class TaskTypesController {
    constructor(private readonly configService: TaskConfigurationService) {}

    @UseInterceptors(new JsonApiInterceptor('task_types'))
    @Get()
    @RequirePermissions('project:read')
    findAll(@Param('projectUuid') projectUuid: string) {
        return this.configService.findTypes(projectUuid);
    }

    @UseInterceptors(new JsonApiInterceptor('task_types'))
    @Post()
    @RequirePermissions('task_type:manage')
    create(
        @Param('projectUuid') projectUuid: string,
        @JsonApiBody() dto: CreateTaskTypeDto,
    ) {
        return this.configService.createType(projectUuid, dto);
    }

    @Delete(':typeUuid')
    @HttpCode(HttpStatus.NO_CONTENT)
    @RequirePermissions('task_type:manage')
    remove(
        @Param('projectUuid') projectUuid: string,
        @Param('typeUuid') typeUuid: string,
    ) {
        return this.configService.deleteType(projectUuid, typeUuid);
    }
}
