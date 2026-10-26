import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRevision } from '@moduleFiles/manager/entities/file-revision.entity';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { User } from '@moduleUsers/entities/user.entity';

@Injectable()
export class FileRevisionsService {
    constructor(
        @InjectRepository(FileRevision)
        private fileRevisionRepository: Repository<FileRevision>,
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(Block)
        private blockRepository: Repository<Block>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async createSnapshot(fileUuid: string, userUuid?: string, customTitle?: string): Promise<FileRevision> {
        const file = await this.fileRepository.findOne({
            where: { uuid: fileUuid },
        });

        if (!file) {
            throw new NotFoundException(`File with uuid ${fileUuid} not found`);
        }

        const blocks = await this.blockRepository.find({
            where: { fileId: file.id },
            order: { orderIndex: 'ASC' },
        });

        let user: User | null = null;
        if (userUuid) {
            user = await this.userRepository.findOne({ where: { uuid: userUuid } });
        }

        const blocksSnapshot = blocks.map((b) => ({
            uuid: b.uuid,
            type: b.type,
            orderIndex: b.orderIndex,
            properties: b.properties || {},
        }));

        const revision = this.fileRevisionRepository.create({
            file,
            fileUuid: file.uuid,
            title: customTitle || file.title,
            blocksSnapshot,
            createdBy: user || undefined,
            createdByUuid: user ? user.uuid : (userUuid || undefined),
        });

        return await this.fileRevisionRepository.save(revision);
    }

    async findAllRevisions(fileUuid: string): Promise<FileRevision[]> {
        const file = await this.fileRepository.findOne({
            where: { uuid: fileUuid },
        });

        if (!file) {
            throw new NotFoundException(`File with uuid ${fileUuid} not found`);
        }

        return await this.fileRevisionRepository.find({
            where: { fileUuid },
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOneRevision(fileUuid: string, revisionUuid: string): Promise<FileRevision> {
        const revision = await this.fileRevisionRepository.findOne({
            where: { uuid: revisionUuid, fileUuid },
            relations: ['createdBy'],
        });

        if (!revision) {
            throw new NotFoundException(`Revision with uuid ${revisionUuid} not found`);
        }

        return revision;
    }

    async restoreRevision(fileUuid: string, revisionUuid: string, userUuid: string): Promise<File> {
        const revision = await this.findOneRevision(fileUuid, revisionUuid);

        const file = await this.fileRepository.findOne({
            where: { uuid: fileUuid },
        });

        if (!file) {
            throw new NotFoundException(`File with uuid ${fileUuid} not found`);
        }

        // Restore file title
        if (revision.title && !revision.title.startsWith('Restored from version')) {
            file.title = revision.title;
            await this.fileRepository.save(file);
        }

        // Remove existing blocks of this file
        await this.blockRepository.delete({ fileId: file.id });

        // Recreate blocks from snapshot
        if (revision.blocksSnapshot && revision.blocksSnapshot.length > 0) {
            const newBlocks = revision.blocksSnapshot.map((b, index) =>
                this.blockRepository.create({
                    fileId: file.id,
                    fileUuid: file.uuid,
                    type: b.type as any,
                    orderIndex: b.orderIndex !== undefined ? b.orderIndex : index,
                    properties: b.properties || {},
                    createdByUuid: userUuid,
                }),
            );
            await this.blockRepository.save(newBlocks);
        }

        // Create a new snapshot documenting this restore operation (non-destructive audit)
        await this.createSnapshot(fileUuid, userUuid);

        return await this.fileRepository.findOneOrFail({
            where: { uuid: fileUuid },
            relations: ['blocks'],
        });
    }
}
