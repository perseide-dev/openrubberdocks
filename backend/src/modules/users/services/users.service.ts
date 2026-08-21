import { Injectable, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { UserType } from '@moduleUsers/enums/users.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@moduleUsers/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

    const user = this.usersRepository.create(
      {
        rubberHandle: createDto.rubberHandle,
        username: createDto.username,
        type: createDto.type,
        password: createDto.password
      });
    return this.usersRepository.save(user);
  }

  async findByRubberHandle(rubberHandle: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { rubberHandle } });
    if (!user) {
      throw new NotFoundException(`User with handle ${rubberHandle} not found`);
    }
    this.logger.log(`Found User ${user.rubberHandle}`);
    return user;
  }

  async findById(userUUID: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { uuid: userUUID } });
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
}
