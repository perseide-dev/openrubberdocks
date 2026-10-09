import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { FilesService } from './services/files.service';
import { FilesController } from './controllers/files.controller';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File, Workspace])],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
