import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Task } from '@moduleProjects/entities/task.entity';
import { User } from '@moduleUsers/entities/user.entity';

@Entity('task_time_logs')
export class TaskTimeLog {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Task, (task) => task.timeLogs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'task_id', referencedColumnName: 'id' })
    task: Task;

    @Column({ name: 'task_id', type: 'int' })
    taskId: number;

    @Column({ name: 'task_uuid', type: 'uuid' })
    taskUuid: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User | null;

    @Column({ name: 'user_id', type: 'int', nullable: true })
    userId: number | null;

    @Column({ name: 'user_uuid', type: 'uuid', nullable: true })
    userUuid: string | null;

    @Column({ type: 'int', comment: 'Logged duration in minutes' })
    minutes: number;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    date: Date;

    @Column({ type: 'varchar', nullable: true })
    description: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
