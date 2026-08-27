import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { FILE_CONSTANTS } from '../constants/file.constants';
import { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { applyJsonApiFilters } from '@common/utils/typeorm-filter.util';

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(File)
        private fileRepository: Repository<File>,
    ) {}

    async create(createFileDto: CreateFileDto, userId: string): Promise<File> {
        const file = this.fileRepository.create({
            ...createFileDto,
            created_by: userId,
        });
        return this.fileRepository.save(file);
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

    async findOne(id: string, query?: JsonApiQueryOptions): Promise<File> {
        const qb = this.fileRepository.createQueryBuilder('file')
            .where('file.id = :id', { id });

        if (query?.relations?.length) {
            query.relations.forEach((relation) => {
                qb.leftJoinAndSelect(`file.${relation}`, relation);
            });
        }

        const file = await qb.getOne();
        if (!file) {
            throw new NotFoundException(FILE_CONSTANTS.ERRORS.FILE_NOT_FOUND());
        }
        return file;
    }

    async update(id: string, updateFileDto: UpdateFileDto): Promise<File> {
        const file = await this.findOne(id);
        const updatedFile = Object.assign(file, updateFileDto);
        return this.fileRepository.save(updatedFile);
    }

    async remove(id: string): Promise<void> {
        const file = await this.findOne(id);
        await this.fileRepository.remove(file);
    }
}
