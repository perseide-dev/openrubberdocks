import { Module } from '@nestjs/common';
import { McpController } from '@moduleMcp/controllers/mcp.controller';
import { McpService } from '@moduleMcp/services/mcp.service';
import { McpAuthGuard } from '@moduleMcp/guards/mcp-auth.guard';
import { WorkspaceModule } from '@moduleWorkspace/workspace.module';
import { ProjectsModule } from '@moduleProjects/projects.module';
import { AuthModule } from '@moduleAuth/auth.module';
import { AuthorizationModule } from '@moduleAuthorization/authorization.module';

@Module({
  imports: [
    WorkspaceModule,
    ProjectsModule,
    AuthModule,
    AuthorizationModule,
  ],
  controllers: [McpController],
  providers: [McpService, McpAuthGuard],
  exports: [McpService],
})
export class McpModule {}
