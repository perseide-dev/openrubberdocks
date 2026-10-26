import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { CreateFileDto } from '@moduleFiles/manager/dto/create-file.dto';
import { UpdateFileDto } from '@moduleFiles/manager/dto/update-file.dto';
import { FILE_ERRORS_CONSTANTS } from '@moduleFiles/manager/constants/file.errors.constants';
import { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { applyJsonApiFilters } from '@commonUtils/typeorm-filter.util';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';

const ALLOWED_FILE_RELATIONS = new Set([
    'workspace',
    'parentPage',
    'childPages',
    'blocks',
    'createdBy',
]);

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(Workspace)
        private workspaceRepository: Repository<Workspace>,
        @Optional()
        @InjectRepository(User)
        private userRepository?: Repository<User>,
    ) {}

    async create(createFileDto: CreateFileDto, userUuid: string): Promise<File> {
        const workspace = await this.workspaceRepository.findOne({
            where: { uuid: createFileDto.workspaceUuid },
        });

        if (!workspace) {
            throw new NotFoundException('Workspace not found');
        }

        let parentPageId: number | null = null;
        if (createFileDto.parentPageUuid) {
            const parentPage = await this.fileRepository.findOne({
                where: { uuid: createFileDto.parentPageUuid },
            });
            if (!parentPage) {
                throw new NotFoundException('Parent page not found');
            }
            parentPageId = parentPage.id;
        }

        let creator: User | null = null;
        if (this.userRepository && userUuid) {
            creator = await this.userRepository.findOne({
                where: { uuid: userUuid },
            });
        }

        const file = this.fileRepository.create({
            ...createFileDto,
            workspaceId: workspace.id,
            parentPageId,
            createdByUuid: userUuid,
            ...(creator?.id !== undefined ? { createdById: creator.id } : {}),
        });
        return await this.fileRepository.save(file);
    }

    async findAll(query: JsonApiQueryOptions): Promise<File[]> {
        const qb = this.fileRepository.createQueryBuilder('file');

        if (query.relations?.length) {
            query.relations
                .filter((relation) => ALLOWED_FILE_RELATIONS.has(relation))
                .forEach((relation) => {
                    qb.leftJoinAndSelect(`file.${relation}`, relation);
                });
        }

        if (query.filters?.length) {
            applyJsonApiFilters(qb, query.filters, 'file');
        }

        return await qb.getMany();
    }

    async findOne(uuid: string, query?: JsonApiQueryOptions): Promise<File> {
        const qb = this.fileRepository.createQueryBuilder('file')
            .where('file.uuid = :uuid', { uuid });

        if (query?.relations?.length) {
            query.relations
                .filter((relation) => ALLOWED_FILE_RELATIONS.has(relation))
                .forEach((relation) => {
                    qb.leftJoinAndSelect(`file.${relation}`, relation);
                });
        }

        const file = await qb.getOne();
        if (!file) {
            throw new NotFoundException(FILE_ERRORS_CONSTANTS.FILE_NOT_FOUND());
        }
        return file;
    }

    async update(uuid: string, updateFileDto: UpdateFileDto): Promise<File> {
        const file = await this.findOne(uuid);

        if ((updateFileDto as any).parentPageUuid !== undefined) {
            const nextParentUuid = (updateFileDto as any).parentPageUuid;
            if (!nextParentUuid) {
                file.parentPageId = null;
                file.parentPageUuid = null;
            } else {
                const parentPage = await this.fileRepository.findOne({
                    where: { uuid: nextParentUuid },
                });
                if (!parentPage) {
                    throw new NotFoundException('Parent page not found');
                }
                file.parentPageId = parentPage.id;
                file.parentPageUuid = parentPage.uuid;
            }
        }

        this.fileRepository.merge(file, updateFileDto);
        return await this.fileRepository.save(file);
    }

    async remove(uuid: string): Promise<void> {
        const file = await this.findOne(uuid);
        await this.fileRepository.remove(file);
    }
}
