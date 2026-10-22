import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
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
import { ProjectsService } from '@moduleProjects/services/projects.service';
import { CreateProjectDto } from '@moduleProjects/dto/create-project.dto';
import { UpdateProjectDto } from '@moduleProjects/dto/update-project.dto';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @UseInterceptors(new JsonApiInterceptor('projects'))
    @Post()
    @RequirePermissions('project:create')
    create(@JsonApiBody() dto: CreateProjectDto, @Req() request: Request) {
        const user = request.user as any;
        return this.projectsService.create(dto, user?.uuid);
    }

    @UseInterceptors(new JsonApiInterceptor('projects'))
    @Get()
    @RequirePermissions('project:read')
    findAll(@Query('workspaceUuid') workspaceUuid: string) {
        return this.projectsService.findAll(workspaceUuid);
    }

    @UseInterceptors(new JsonApiInterceptor('projects'))
    @Get(':uuid')
    @RequirePermissions('project:read')
    findOne(@Param('uuid') uuid: string) {
        return this.projectsService.findOne(uuid);
    }

    @UseInterceptors(new JsonApiInterceptor('projects'))
    @Patch(':uuid')
    @RequirePermissions('project:update')
    update(@Param('uuid') uuid: string, @JsonApiBody() dto: UpdateProjectDto) {
        return this.projectsService.update(uuid, dto);
    }

    @Delete(':uuid')
    @HttpCode(HttpStatus.NO_CONTENT)
    @RequirePermissions('project:delete')
    remove(@Param('uuid') uuid: string) {
        return this.projectsService.delete(uuid);
    }
}
