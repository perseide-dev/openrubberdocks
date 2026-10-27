import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { FileRevision } from '@moduleFiles/manager/entities/file-revision.entity';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { FilesService } from '@moduleFiles/manager/services/files.service';
import { FileRevisionsService } from '@moduleFiles/manager/services/file-revisions.service';
import { FilesController } from '@moduleFiles/manager/controllers/files.controller';
import { FileRevisionsController } from '@moduleFiles/manager/controllers/file-revisions.controller';
import { AuthorizationModule } from '@moduleAuthorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, FileRevision, Block, Workspace, User]),
    AuthorizationModule,
  ],
  controllers: [FilesController, FileRevisionsController],
  providers: [FilesService, FileRevisionsService],
  exports: [FilesService, FileRevisionsService],
})
export class FilesModule {}
