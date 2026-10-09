import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { BlockRevision } from './entities/block-revision.entity';
import { BlocksService } from './services/blocks.service';
import { BlocksController } from './controllers/blocks.controller';
import { File } from '@moduleFiles/manager/entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block, BlockRevision, File])],
  controllers: [BlocksController],
  providers: [BlocksService]
})
export class BlocksModule { }
