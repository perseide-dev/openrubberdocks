import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '../entities/block.entity';
import { BlockRevision } from '../entities/block-revision.entity';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { MoveBlockDto } from '../dto/move-block.dto';
import { BLOCK_ERRORS_CONSTANTS } from '../constants/block.errors.constants';
import { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { applyJsonApiFilters } from '@common/utils/typeorm-filter.util';

@Injectable()
export class BlocksService {
    constructor(
        @InjectRepository(Block)
        private blockRepository: Repository<Block>,
        @InjectRepository(BlockRevision)
        private blockRevisionRepository: Repository<BlockRevision>,
    ) {}

    async create(createBlockDto: CreateBlockDto, userId: string): Promise<Block> {
        const block = this.blockRepository.create(createBlockDto);
        const savedBlock = await this.blockRepository.save(block);

        const revision = this.blockRevisionRepository.create({
            block_id: savedBlock.id,
            properties: savedBlock.properties,
            created_by: userId,
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
        
        qb.orderBy('block.order_index', 'ASC');

        return await qb.getMany();
    }

    async findOne(id: string, query?: JsonApiQueryOptions): Promise<Block> {
        const qb = this.blockRepository.createQueryBuilder('block')
            .where('block.id = :id', { id });

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

    async update(id: string, updateBlockDto: UpdateBlockDto, userId: string): Promise<Block> {
        const block = await this.findOne(id);
        block.properties = updateBlockDto.properties || block.properties;
        const savedBlock = await this.blockRepository.save(block);

        const revision = this.blockRevisionRepository.create({
            block_id: savedBlock.id,
            properties: savedBlock.properties,
            created_by: userId,
        });
        await this.blockRevisionRepository.save(revision);

        return savedBlock;
    }

    async move(id: string, moveBlockDto: MoveBlockDto): Promise<Block> {
        const block = await this.findOne(id);
        block.order_index = moveBlockDto.new_order_index;
        if (moveBlockDto.new_parent_block_id !== undefined) {
            block.parent_block_id = moveBlockDto.new_parent_block_id;
        }
        return this.blockRepository.save(block);
    }

    async remove(id: string): Promise<void> {
        const block = await this.findOne(id);
        await this.blockRepository.remove(block);
    }
}
