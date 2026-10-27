import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@moduleProjects/entities/project.entity';
import { Task } from '@moduleProjects/entities/task.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';
import { TaskPropertyDefinition } from '@moduleProjects/entities/task-property-definition.entity';
import { TaskTimeLog } from '@moduleProjects/entities/task-time-log.entity';
import { TaskDependency } from '@moduleProjects/entities/task-dependency.entity';
import { ProjectFileLink } from '@moduleProjects/entities/project-file-link.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { AuthorizationModule } from '@moduleAuthorization/authorization.module';

import { ProjectsController } from '@moduleProjects/controllers/projects.controller';
import { TaskStatusesController } from '@moduleProjects/controllers/task-statuses.controller';
import { TaskTypesController } from '@moduleProjects/controllers/task-types.controller';
import { TaskPropertiesController } from '@moduleProjects/controllers/task-properties.controller';
import { ProjectFilesController } from '@moduleProjects/controllers/project-files.controller';
import { TasksController } from '@moduleProjects/controllers/tasks.controller';
import { TaskTimeLogsController } from '@moduleProjects/controllers/task-time-logs.controller';

import { ProjectsService } from '@moduleProjects/services/projects.service';
import { TasksService } from '@moduleProjects/services/tasks.service';
import { TaskConfigurationService } from '@moduleProjects/services/task-configuration.service';
import { TaskTimeLogsService } from '@moduleProjects/services/task-time-logs.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Project,
            Task,
            TaskStatus,
            TaskType,
            TaskPropertyDefinition,
            TaskTimeLog,
            TaskDependency,
            ProjectFileLink,
            Workspace,
            User,
            File,
        ]),
        AuthorizationModule,
    ],
    controllers: [
        ProjectsController,
        TaskStatusesController,
        TaskTypesController,
        TaskPropertiesController,
        ProjectFilesController,
        TasksController,
        TaskTimeLogsController,
    ],
    providers: [
        ProjectsService,
        TasksService,
        TaskConfigurationService,
        TaskTimeLogsService,
    ],
    exports: [
        ProjectsService,
        TasksService,
        TaskConfigurationService,
        TaskTimeLogsService,
    ],
})
export class ProjectsModule {}
