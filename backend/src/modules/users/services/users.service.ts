import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserType } from '@moduleUsers/enums/users.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@moduleUsers/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async create(createDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({ where: { rubberHandle: createDto.rubberHandle } });

    if (createDto.type === UserType.COREADMIN) {
      const existCoreUser = await this.usersRepository.findOne({ where: { type: UserType.COREADMIN } });
      if (existCoreUser) throw new ConflictException();
    }
    if (existingUser) {
      throw new ConflictException('User @ already exists');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(createDto.password, saltOrRounds);

    const user = this.usersRepository.create(
      {
        rubberHandle: createDto.rubberHandle,
        username: createDto.username,
        type: createDto.type,
        password:  hashedPassword
      });
    return this.usersRepository.save(user);
  }

  async findByRubberHandle(rubberHandle: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { rubberHandle: rubberHandle } });

    if (!user) throw new NotFoundException(`User ${rubberHandle} could not be found`);

    return user;
  }

  async findById(userUUID: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { uuid: userUUID } });
    if (!user) throw new NotFoundException(`User ${userUUID} could not be found`);
    return user;
  }

  async updateRefreshToken(id: string, hashedRefreshToken: string | null): Promise<void> {
    await this.usersRepository.update(id, {
      hashedRefreshToken,
    });
  }
}
