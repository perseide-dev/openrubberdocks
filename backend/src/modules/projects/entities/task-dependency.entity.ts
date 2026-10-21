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

export type TaskDependencyType = 'BLOCKS' | 'BLOCKED_BY' | 'RELATES_TO';

@Entity('task_dependencies')
export class TaskDependency {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Task, (task) => task.dependencies, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'task_id', referencedColumnName: 'id' })
    task: Task;

    @Column({ name: 'task_id', type: 'int' })
    taskId: number;

    @Column({ name: 'task_uuid', type: 'uuid' })
    taskUuid: string;

    @ManyToOne(() => Task, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'depends_on_task_id', referencedColumnName: 'id' })
    dependsOnTask: Task;

    @Column({ name: 'depends_on_task_id', type: 'int' })
    dependsOnTaskId: number;

    @Column({ name: 'depends_on_task_uuid', type: 'uuid' })
    dependsOnTaskUuid: string;

    @Column({
        type: 'varchar',
        default: 'BLOCKS',
    })
    type: TaskDependencyType;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
