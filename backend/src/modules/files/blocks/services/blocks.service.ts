import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../entities/block.entity';
import { BlockRevision } from '../entities/block-revision.entity';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { MoveBlockDto } from '../dto/move-block.dto';
import { BLOCK_ERRORS_CONSTANTS } from '../constants/block.errors.constants';
import { FILE_ERRORS_CONSTANTS } from '@moduleFiles/manager/constants/file.errors.constants';
import { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { applyJsonApiFilters } from '@common/utils/typeorm-filter.util';
import { File } from '@moduleFiles/manager/entities/file.entity';

@Injectable()
export class BlocksService {
    constructor(
        @InjectRepository(Block)
        private blockRepository: Repository<Block>,
        @InjectRepository(BlockRevision)
        private blockRevisionRepository: Repository<BlockRevision>,
        @InjectRepository(File)
        private fileRepository: Repository<File>,
    ) { }

    async create(createBlockDto: CreateBlockDto, userUuid: string): Promise<Block> {
        const file = await this.fileRepository.findOne({
            where: { uuid: createBlockDto.fileUuid },
        });

        if (!file) {
            throw new NotFoundException(FILE_ERRORS_CONSTANTS.FILE_NOT_FOUND());
        }

        const block = this.blockRepository.create({
            ...createBlockDto,
            fileId: file.id,
            createdByUuid: userUuid,
        });
        const savedBlock = await this.blockRepository.save(block);

        const revision = this.blockRevisionRepository.create({
            blockUuid: savedBlock.uuid,
            blockId: savedBlock.id,
            properties: savedBlock.properties,
            createdByUuid: userUuid,
        });
        await this.blockRevisionRepository.save(revision);

        return savedBlock;
    }

    async findAll(query: JsonApiQueryOptions): Promise<Block[]> {
        const qb = this.blockRepository.createQueryBuilder('block');

        if (query.relations?.length) {
            query.relations.forEach((relation) => {
                qb.leftJoinAndSelect(`block.${relation}`, relation);
            });
        }

        if (query.filters?.length) {
            applyJsonApiFilters(qb, query.filters, 'block');
        }

        qb.orderBy('block.orderIndex', 'ASC');

        return await qb.getMany();
    }

    async findOne(uuid: string, query?: JsonApiQueryOptions): Promise<Block> {
        const qb = this.blockRepository.createQueryBuilder('block')
            .where('block.uuid = :uuid', { uuid });

        if (query?.relations?.length) {
            query.relations.forEach((relation) => {
                qb.leftJoinAndSelect(`block.${relation}`, relation);
            });
        }

        const block = await qb.getOne();
        if (!block) {
            throw new NotFoundException(BLOCK_ERRORS_CONSTANTS.BLOCK_NOT_FOUND());
        }
        return block;
    }

    async update(uuid: string, updateBlockDto: UpdateBlockDto, userUuid: string): Promise<Block> {
        const block = await this.findOne(uuid);
        this.blockRepository.merge(block, updateBlockDto);
        const savedBlock = await this.blockRepository.save(block);

        const revision = this.blockRevisionRepository.create({
            blockUuid: savedBlock.uuid,
            blockId: savedBlock.id,
            properties: savedBlock.properties,
            createdByUuid: userUuid,
        });
        await this.blockRevisionRepository.save(revision);

        return savedBlock;
    }

    async move(uuid: string, moveBlockDto: MoveBlockDto): Promise<Block> {
        const block = await this.findOne(uuid);
        block.orderIndex = moveBlockDto.newOrderIndex;
        if (moveBlockDto.newParentBlockUuid !== undefined) {
            block.parentBlockUuid = moveBlockDto.newParentBlockUuid;
        }
        return await this.blockRepository.save(block);
    }

    async remove(uuid: string): Promise<void> {
        const block = await this.findOne(uuid);
        await this.blockRepository.remove(block);
    }
}
