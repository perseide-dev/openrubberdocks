import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Project } from '@moduleProjects/entities/project.entity';

export type TaskPropertyType =
    | 'text'
    | 'number'
    | 'select'
    | 'multi_select'
    | 'date'
    | 'checkbox'
    | 'url'
    | 'user';

export interface PropertyOption {
    id: string;
    label: string;
    color?: string;
}

@Entity('task_property_definitions')
export class TaskPropertyDefinition {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Project, (project) => project.propertyDefinitions, { onDelete: 'CASCADE' })
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
        default: 'text',
    })
    type: TaskPropertyType;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    options: PropertyOption[] | null;

    @Column({ name: 'order_index', type: 'int', default: 0 })
    orderIndex: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
