import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { CreateWorkspaceDto } from '@moduleWorkspace/dto/create-workspace.dto';
import { UpdateWorkspaceDto } from '@moduleWorkspace/dto/update-workspace.dto';
import { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { applyJsonApiFilters } from '@common/utils/typeorm-filter.util';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) { }

  async create(createWorkspaceDto: CreateWorkspaceDto, userUUID: string): Promise<Workspace> {
    const workspace = this.workspaceRepository.create({
      ...createWorkspaceDto,
      createdByUUID: userUUID,
    });
    return await this.workspaceRepository.save(workspace);
  }

  async findAll(query: JsonApiQueryOptions): Promise<Workspace[]> {
    const qb = this.workspaceRepository.createQueryBuilder('workspace');

    // 1. Apply Relationships Inclusion (if any)
    if (query.relations?.length) {
      query.relations.forEach((relation) => {
        qb.leftJoinAndSelect(`workspace.${relation}`, relation);
      });
    }

    // 2. Dynamic Filter Construction
    if (query.filters?.length) {
      applyJsonApiFilters(qb, query.filters, 'workspace');
    }

    return await qb.getMany();
  }

  async findOne(uuid: string, query?: JsonApiQueryOptions): Promise<Workspace> {
    const qb = this.workspaceRepository.createQueryBuilder('workspace')
      .where('workspace.uuid = :uuid', { uuid });

    if (query?.relations?.length) {
      query.relations.forEach((relation) => {
        qb.leftJoinAndSelect(`workspace.${relation}`, relation);
      });
    }

    const workspace = await qb.getOne();

    if (!workspace) {
      throw new NotFoundException(`Workspace with UUID ${uuid} not found`);
    }

    return workspace;
  }

  async update(uuid: string, updateWorkspaceDto: UpdateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.findOne(uuid);

    // Merge the updates into the retrieved entity
    this.workspaceRepository.merge(workspace, updateWorkspaceDto);

    return await this.workspaceRepository.save(workspace);
  }

  async remove(uuid: string): Promise<void> {
    const workspace = await this.findOne(uuid);
    await this.workspaceRepository.remove(workspace);
  }
}
