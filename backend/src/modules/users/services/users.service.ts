import { Injectable, ConflictException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserType } from '@moduleUsers/enums/users.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@moduleUsers/entities/user.entity';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';
import { CreateUserDto } from '@moduleUsers/dto/create-user.dto';
import { AUTHORIZATION_ERRORS } from '@moduleAuthorization/constants/authorization.errors.constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleScope)
    private readonly scopeRepository: Repository<UserRoleScope>,
  ) { }

  async create(createDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { rubberHandle: createDto.rubberHandle } });

    if (createDto.type === UserType.COREADMIN) {
      const existCoreUser = await this.usersRepository.findOne({ where: { type: UserType.COREADMIN } });
      if (existCoreUser) throw new ConflictException('Core User already exist');
    }
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    let initialRole: Role | null = null;
    if (createDto.initialRoleUuid) {
      initialRole = await this.roleRepository.findOne({
        where: { uuid: createDto.initialRoleUuid },
      });
      if (!initialRole) {
        throw new NotFoundException(AUTHORIZATION_ERRORS.ROLE_NOT_FOUND());
      }
      if (!initialRole.isAssignable && createDto.type !== UserType.COREADMIN) {
        throw new BadRequestException(AUTHORIZATION_ERRORS.CANNOT_ASSIGN_SUPER_ADMIN());
      }
    }

    const user = this.usersRepository.create(
      {
        rubberHandle: createDto.rubberHandle,
        username: createDto.username,
        type: createDto.type,
        password: createDto.password
      });
    const savedUser = await this.usersRepository.save(user);

    if (initialRole) {
      const scope = this.scopeRepository.create({
        user: savedUser,
        role: initialRole,
      });
      await this.scopeRepository.save(scope);
    }

    return savedUser;
  }

  async findByRubberHandle(rubberHandle: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { rubberHandle },
      relations: [
        'scopes',
        'scopes.role',
        'scopes.role.permissions',
        'scopes.workspace',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with handle ${rubberHandle} not found`);
    }
    this.logger.log(`Found User ${user.rubberHandle}`);
    return user;
  }

  async findById(userUUID: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { uuid: userUUID },
      relations: [
        'scopes',
        'scopes.role',
        'scopes.role.permissions',
        'scopes.workspace',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with UUID ${userUUID} not found`);
    }
    return user;
  }

  async updateRefreshToken(id: string, hashedRefreshToken: string | null): Promise<void> {
    await this.usersRepository.update({ uuid: id }, {
      hashedRefreshToken,
    });
  }

  async findAll(search?: string): Promise<User[]> {
    const qb = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.scopes', 'scopes')
      .leftJoinAndSelect('scopes.role', 'role')
      .leftJoinAndSelect('scopes.workspace', 'workspace')
      .orderBy('user.createdAt', 'DESC');

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      qb.where('LOWER(user.rubberHandle) LIKE :term OR LOWER(user.username) LIKE :term', { term });
    }
    qb.limit(50);
    return await qb.getMany();
  }
}
