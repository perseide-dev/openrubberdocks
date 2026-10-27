import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Project } from '@moduleProjects/entities/project.entity';
import { Task } from '@moduleProjects/entities/task.entity';

export type TaskStatusCategory = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

@Entity('task_statuses')
export class TaskStatus {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Project, (project) => project.statuses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
    project: Project;

    @Column({ name: 'project_id', type: 'int' })
    projectId: number;

    @Column({ name: 'project_uuid', type: 'uuid' })
    projectUuid: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({
        type: 'varchar',
        default: 'TODO',
    })
    category: TaskStatusCategory;

    @Column({ type: 'varchar', default: '#71717A' })
    color: string;

    @Column({ name: 'order_index', type: 'int', default: 0 })
    orderIndex: number;

    @Column({ name: 'is_default', type: 'boolean', default: false })
    isDefault: boolean;

    @OneToMany(() => Task, (task) => task.status)
    tasks: Task[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
