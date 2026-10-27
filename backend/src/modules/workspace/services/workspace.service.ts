import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { WorkspaceMember } from '@moduleWorkspace/entities/workspace-member.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { CreateWorkspaceDto } from '@moduleWorkspace/dto/create-workspace.dto';
import { UpdateWorkspaceDto } from '@moduleWorkspace/dto/update-workspace.dto';
import { JsonApiQueryOptions } from '@commonDecorators/json-api-query.decorator';
import { applyJsonApiFilters } from '@commonUtils/typeorm-filter.util';
import { UserType } from '@moduleUsers/enums/users.enum';
import { WORKSPACE_ERRORS_CONSTANTS } from '@moduleWorkspace/constants/workspace.errors.constants';

const ALLOWED_WORKSPACE_RELATIONS = new Set(['createdBy', 'members', 'files']);

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @Optional()
    @InjectRepository(User)
    private readonly userRepository?: Repository<User>,
    @Optional()
    @InjectRepository(WorkspaceMember)
    private readonly memberRepository?: Repository<WorkspaceMember>,
  ) { }

  async create(createWorkspaceDto: CreateWorkspaceDto, userUUID: string): Promise<Workspace> {
    let creator: User | null = null;
    if (this.userRepository && userUUID) {
      creator = await this.userRepository.findOne({ where: { uuid: userUUID } });
    }

    const workspace = this.workspaceRepository.create({
      ...createWorkspaceDto,
      createdByUUID: userUUID,
      ...(creator?.id !== undefined ? { createdById: creator.id } : {}),
    });
    const savedWorkspace = await this.workspaceRepository.save(workspace);

    if (creator && this.memberRepository) {
      const existingMember = await this.memberRepository.findOne({
        where: { workspaceId: savedWorkspace.id, userId: creator.id },
      });
      if (!existingMember) {
        const member = this.memberRepository.create({
          workspace: savedWorkspace,
          workspaceId: savedWorkspace.id,
          user: creator,
          userId: creator.id,
          joinedAt: new Date(),
        });
        await this.memberRepository.save(member);
      }
    }

    return savedWorkspace;
  }

  async findAll(query: JsonApiQueryOptions, user?: any): Promise<Workspace[]> {
    const qb = this.workspaceRepository.createQueryBuilder('workspace');

    // 1. Apply Relationships Inclusion (if any)
    if (query.relations?.length) {
      query.relations
        .filter((relation) => ALLOWED_WORKSPACE_RELATIONS.has(relation))
        .forEach((relation) => {
          qb.leftJoinAndSelect(`workspace.${relation}`, relation);
        });
    }

    // 2. Dynamic Filter Construction
    if (query.filters?.length) {
      applyJsonApiFilters(qb, query.filters, 'workspace');
    }

    // 3. User Scoping
    if (user && user.type !== UserType.COREADMIN) {
      const hasGlobalScope = user.scopes?.some(
        (s: any) =>
          !s.workspace &&
          !s.workspaceId &&
          s.role?.permissions?.some((p: any) => p.action === 'workspace:read'),
      );
      if (!hasGlobalScope) {
        qb.andWhere(
          `workspace.id IN (
            SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = :userId
            UNION
            SELECT urs.workspace_id FROM user_role_scopes urs WHERE urs.user_id = :userId AND urs.workspace_id IS NOT NULL
            ${user.type === UserType.INTERNAL ? 'UNION SELECT w2.id FROM workspace w2 WHERE w2.created_by_uuid = :userUuid' : ''}
          )`,
          { userId: user.id, userUuid: user.uuid },
        );
      }
    }

    return await qb.getMany();
  }

  async findOne(uuid: string, query?: JsonApiQueryOptions): Promise<Workspace> {
    const qb = this.workspaceRepository.createQueryBuilder('workspace')
      .where('workspace.uuid = :uuid', { uuid });

    if (query?.relations?.length) {
      query.relations
        .filter((relation) => ALLOWED_WORKSPACE_RELATIONS.has(relation))
        .forEach((relation) => {
          qb.leftJoinAndSelect(`workspace.${relation}`, relation);
        });
    }

    const workspace = await qb.getOne();

    if (!workspace) {
      throw new NotFoundException(WORKSPACE_ERRORS_CONSTANTS.WORKSPACE_NOT_FOUND(uuid));
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
