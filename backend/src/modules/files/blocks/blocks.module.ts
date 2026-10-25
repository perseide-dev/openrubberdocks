import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { BlockRevision } from '@moduleFiles/blocks/entities/block-revision.entity';
import { BlocksService } from '@moduleFiles/blocks/services/blocks.service';
import { BlocksController } from '@moduleFiles/blocks/controllers/blocks.controller';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { AuthorizationModule } from '@moduleAuthorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Block, BlockRevision, File]),
    AuthorizationModule,
  ],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule { }
