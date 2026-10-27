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

@Entity('task_types')
export class TaskType {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Project, (project) => project.types, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
    project: Project;

    @Column({ name: 'project_id', type: 'int' })
    projectId: number;

    @Column({ name: 'project_uuid', type: 'uuid' })
    projectUuid: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', default: 'task', comment: 'Emoji or icon identifier' })
    icon: string;

    @Column({ type: 'varchar', default: '#3B82F6' })
    color: string;

    @Column({ name: 'is_default', type: 'boolean', default: false })
    isDefault: boolean;

    @OneToMany(() => Task, (task) => task.type)
    tasks: Task[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
