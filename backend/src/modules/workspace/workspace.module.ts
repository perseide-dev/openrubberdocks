import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { WorkspaceController } from '@moduleWorkspace/controllers/workspace.controller';
import { WorkspaceService } from '@moduleWorkspace/services/workspace.service';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace]),
    AuthModule
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService]
})
export class WorkspaceModule { }
