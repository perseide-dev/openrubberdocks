import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskTimeLog } from '@moduleProjects/entities/task-time-log.entity';
import { Task } from '@moduleProjects/entities/task.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { CreateTaskTimeLogDto } from '@moduleProjects/dto/create-task-time-log.dto';

@Injectable()
export class TaskTimeLogsService {
    constructor(
        @InjectRepository(TaskTimeLog)
        private readonly timeLogRepository: Repository<TaskTimeLog>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(taskUuid: string, dto: CreateTaskTimeLogDto, userUuid?: string): Promise<TaskTimeLog> {
        const task = await this.taskRepository.findOne({ where: { uuid: taskUuid } });
        if (!task) {
            throw new NotFoundException(`Task with uuid ${taskUuid} not found`);
        }

        let user: User | null = null;
        if (userUuid) {
            user = await this.userRepository.findOne({ where: { uuid: userUuid } });
        }

        const log = this.timeLogRepository.create({
            task,
            taskId: task.id,
            taskUuid: task.uuid,
            user,
            userId: user ? user.id : null,
            userUuid: user ? user.uuid : (userUuid || null),
            minutes: dto.minutes,
            date: dto.date ? new Date(dto.date) : new Date(),
            description: dto.description || null,
        });

        return this.timeLogRepository.save(log);
    }

    async findAll(taskUuid: string): Promise<TaskTimeLog[]> {
        const task = await this.taskRepository.findOne({ where: { uuid: taskUuid } });
        if (!task) {
            throw new NotFoundException(`Task with uuid ${taskUuid} not found`);
        }

        return this.timeLogRepository.find({
            where: { taskUuid },
            relations: ['user'],
            order: { date: 'DESC', createdAt: 'DESC' },
        });
    }

    async delete(taskUuid: string, logUuid: string): Promise<void> {
        const log = await this.timeLogRepository.findOne({
            where: { uuid: logUuid, taskUuid },
        });
        if (!log) {
            throw new NotFoundException(`Time log ${logUuid} not found for task`);
        }
        await this.timeLogRepository.remove(log);
    }
}
