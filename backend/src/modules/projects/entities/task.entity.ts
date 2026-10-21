import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    JoinColumn,
    Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Project } from '@moduleProjects/entities/project.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { TaskTimeLog } from '@moduleProjects/entities/task-time-log.entity';
import { TaskDependency } from '@moduleProjects/entities/task-dependency.entity';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
    project: Project;

    @Column({ name: 'project_id', type: 'int' })
    projectId: number;

    @Column({ name: 'project_uuid', type: 'uuid' })
    projectUuid: string;

    @ManyToOne(() => TaskStatus, (status) => status.tasks, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'status_id', referencedColumnName: 'id' })
    status: TaskStatus;

    @Column({ name: 'status_id', type: 'int' })
    statusId: number;

    @Column({ name: 'status_uuid', type: 'uuid' })
    statusUuid: string;

    @ManyToOne(() => TaskType, (type) => type.tasks, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'type_id', referencedColumnName: 'id' })
    type: TaskType;

    @Column({ name: 'type_id', type: 'int' })
    typeId: number;

    @Column({ name: 'type_uuid', type: 'uuid' })
    typeUuid: string;

    @ManyToOne(() => Task, (task) => task.subtasks, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_task_id' })
    parentTask: Task | null;

    @Column({ name: 'parent_task_id', type: 'int', nullable: true })
    parentTaskId: number | null;

    @Column({ name: 'parent_task_uuid', type: 'uuid', nullable: true })
    parentTaskUuid: string | null;

    @OneToMany(() => Task, (task) => task.parentTask)
    subtasks: Task[];

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'order_index', type: 'int', default: 0 })
    orderIndex: number;

    @Column({ name: 'start_date', type: 'timestamp with time zone', nullable: true })
    startDate: Date | null;

    @Column({ name: 'due_date', type: 'timestamp with time zone', nullable: true })
    dueDate: Date | null;

    @Column({ name: 'estimated_minutes', type: 'int', nullable: true })
    estimatedMinutes: number | null;

    @Column({ name: 'custom_properties', type: 'jsonb', default: {} })
    customProperties: Record<string, any>;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User | null;

    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    createdById: number | null;

    @Column({ name: 'created_by_uuid', type: 'uuid', nullable: true })
    createdByUuid: string | null;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'task_assignees',
        joinColumn: { name: 'task_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    assignees: User[];

    @OneToMany(() => TaskTimeLog, (log) => log.task)
    timeLogs: TaskTimeLog[];

    @OneToMany(() => TaskDependency, (dep) => dep.task)
    dependencies: TaskDependency[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
