import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { WorkspaceController } from '@moduleWorkspace/controllers/workspace.controller';
import { WorkspaceService } from '@moduleWorkspace/services/workspace.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService]
})
export class WorkspaceModule {}
