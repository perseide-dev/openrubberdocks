import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './entities/block.entity';
import { BlockRevision } from './entities/block-revision.entity';
import { BlocksService } from './services/blocks.service';
import { BlocksController } from './controllers/blocks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Block, BlockRevision])],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService]
})
export class BlocksModule { }
