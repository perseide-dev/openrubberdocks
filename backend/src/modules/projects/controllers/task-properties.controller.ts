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
import { CreateTaskPropertyDto } from '@moduleProjects/dto/create-task-property.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('projects/:projectUuid/properties')
export class TaskPropertiesController {
    constructor(private readonly configService: TaskConfigurationService) {}

    @UseInterceptors(new JsonApiInterceptor('task_properties'))
    @Get()
    @RequirePermissions('project:read')
    findAll(@Param('projectUuid') projectUuid: string) {
        return this.configService.findProperties(projectUuid);
    }

    @UseInterceptors(new JsonApiInterceptor('task_properties'))
    @Post()
    @RequirePermissions('task_property:manage')
    create(
        @Param('projectUuid') projectUuid: string,
        @JsonApiBody() dto: CreateTaskPropertyDto,
    ) {
        return this.configService.createProperty(projectUuid, dto);
    }

    @Delete(':propertyUuid')
    @HttpCode(HttpStatus.NO_CONTENT)
    @RequirePermissions('task_property:manage')
    remove(
        @Param('projectUuid') projectUuid: string,
        @Param('propertyUuid') propertyUuid: string,
    ) {
        return this.configService.deleteProperty(projectUuid, propertyUuid);
    }
}
