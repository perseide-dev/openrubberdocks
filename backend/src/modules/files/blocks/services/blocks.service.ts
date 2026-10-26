import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { BlockRevision } from '@moduleFiles/blocks/entities/block-revision.entity';
import { CreateBlockDto } from '@moduleFiles/blocks/dto/create-block.dto';
import { UpdateBlockDto } from '@moduleFiles/blocks/dto/update-block.dto';
import { MoveBlockDto } from '@moduleFiles/blocks/dto/move-block.dto';
import { SyncBlocksDto } from '@moduleFiles/blocks/dto/sync-blocks.dto';
import { BLOCK_ERRORS_CONSTANTS } from '@moduleFiles/blocks/constants/block.errors.constants';
import { FILE_ERRORS_CONSTANTS } from '@moduleFiles/manager/constants/file.errors.constants';
import { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { applyJsonApiFilters } from '@commonUtils/typeorm-filter.util';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { User } from '@moduleUsers/entities/user.entity';

const ALLOWED_BLOCK_RELATIONS = new Set([
    'file',
    'parentBlock',
    'childBlocks',
    'revisions',
    'createdBy',
]);

@Injectable()
export class BlocksService {
    constructor(
        @InjectRepository(Block)
        private blockRepository: Repository<Block>,
        @InjectRepository(BlockRevision)
        private blockRevisionRepository: Repository<BlockRevision>,
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @Optional()
        @InjectRepository(User)
        private userRepository?: Repository<User>,
    ) { }

    async create(createBlockDto: CreateBlockDto, userUuid: string): Promise<Block> {
        const file = await this.fileRepository.findOne({
            where: { uuid: createBlockDto.fileUuid },
        });

        if (!file) {
            throw new NotFoundException(FILE_ERRORS_CONSTANTS.FILE_NOT_FOUND());
        }

        let parentBlockId: number | undefined;
        if (createBlockDto.parentBlockUuid && this.blockRepository.findOne) {
            const parentBlock = await this.blockRepository.findOne({
                where: { uuid: createBlockDto.parentBlockUuid },
            });
            if (!parentBlock) {
                throw new NotFoundException('Parent block not found');
            }
            parentBlockId = parentBlock.id;
        }

        let creator: User | null = null;
        if (this.userRepository && userUuid) {
            creator = await this.userRepository.findOne({
                where: { uuid: userUuid },
            });
        }

        const block = this.blockRepository.create({
            ...createBlockDto,
            fileId: file.id,
            createdByUuid: userUuid,
            ...(parentBlockId !== undefined ? { parentBlockId } : {}),
            ...(creator?.id !== undefined ? { createdById: creator.id } : {}),
        });
        const savedBlock = await this.blockRepository.save(block);

        const revision = this.blockRevisionRepository.create({
            blockUuid: savedBlock.uuid,
            blockId: savedBlock.id,
            properties: savedBlock.properties,
            createdByUuid: userUuid,
            ...(creator?.id !== undefined ? { createdById: creator.id } : {}),
        });
        await this.blockRevisionRepository.save(revision);

        return savedBlock;
    }

    async syncFileBlocks(
        fileUuid: string,
        syncBlocksDto: SyncBlocksDto,
        userUuid: string,
    ): Promise<Block[]> {
        const file = await this.fileRepository.findOne({
            where: { uuid: fileUuid },
        });

        if (!file) {
            throw new NotFoundException(FILE_ERRORS_CONSTANTS.FILE_NOT_FOUND());
        }

        let creator: User | null = null;
        if (this.userRepository && userUuid) {
            creator = await this.userRepository.findOne({
                where: { uuid: userUuid },
            });
        }

        const runSync = async (repo: Repository<Block>): Promise<Block[]> => {
            if (repo.delete) {
                await repo.delete({ fileId: file.id });
            }

            const items = syncBlocksDto?.blocks ?? [];
            if (items.length === 0) {
                return [];
            }

            const createdBlocks = items.map((item, idx) =>
                repo.create({
                    fileId: file.id,
                    fileUuid: file.uuid,
                    type: item.type,
                    properties: item.properties ?? {},
                    orderIndex: item.orderIndex ?? idx,
                    ...(item.parentBlockUuid ? { parentBlockUuid: item.parentBlockUuid } : {}),
                    createdByUuid: userUuid,
                    ...(creator?.id !== undefined ? { createdById: creator.id } : {}),
                }),
            );

            return await repo.save(createdBlocks);
        };

        if (this.blockRepository.manager?.transaction) {
            return await this.blockRepository.manager.transaction(async (em) => {
                const txBlockRepo = em.getRepository(Block);
                return await runSync(txBlockRepo);
            });
        }

        return await runSync(this.blockRepository);
    }

    async findAll(query: JsonApiQueryOptions): Promise<Block[]> {
        const qb = this.blockRepository.createQueryBuilder('block');

        if (query.relations?.length) {
            query.relations
                .filter((relation) => ALLOWED_BLOCK_RELATIONS.has(relation))
                .forEach((relation) => {
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
            query.relations
                .filter((relation) => ALLOWED_BLOCK_RELATIONS.has(relation))
                .forEach((relation) => {
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
            if (!moveBlockDto.newParentBlockUuid) {
                block.parentBlockId = null as any;
            } else if (this.blockRepository.findOne) {
                const parentBlock = await this.blockRepository.findOne({
                    where: { uuid: moveBlockDto.newParentBlockUuid },
                });
                if (parentBlock) {
                    block.parentBlockId = parentBlock.id;
                }
            }
        }
        return await this.blockRepository.save(block);
    }

    async remove(uuid: string): Promise<void> {
        const block = await this.findOne(uuid);
        await this.blockRepository.remove(block);
    }
}
