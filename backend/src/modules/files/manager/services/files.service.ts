import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { FILE_ERRORS_CONSTANTS } from '../constants/file.errors.constants';
import { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { applyJsonApiFilters } from '@common/utils/typeorm-filter.util';

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
    ) {}

    async create(createFileDto: CreateFileDto, userUuid: string): Promise<File> {
        const file = this.fileRepository.create({
            ...createFileDto,
            createdByUuid: userUuid,
        });
        return await this.fileRepository.save(file);
    }

    async findAll(query: JsonApiQueryOptions): Promise<File[]> {
        const qb = this.fileRepository.createQueryBuilder('file');

        if (query.relations?.length) {
            query.relations.forEach((relation) => {
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
            query.relations.forEach((relation) => {
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
        this.fileRepository.merge(file, updateFileDto);
        return await this.fileRepository.save(file);
    }

    async remove(uuid: string): Promise<void> {
        const file = await this.findOne(uuid);
        await this.fileRepository.remove(file);
    }
}
