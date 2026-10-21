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
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { Task } from '@moduleProjects/entities/task.entity';
import { TaskStatus } from '@moduleProjects/entities/task-status.entity';
import { TaskType } from '@moduleProjects/entities/task-type.entity';
import { TaskPropertyDefinition } from '@moduleProjects/entities/task-property-definition.entity';
import { ProjectFileLink } from '@moduleProjects/entities/project-file-link.entity';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'varchar', nullable: true, comment: 'Emoji or icon identifier' })
    icon: string | null;

    @Column({ name: 'cover_image', type: 'varchar', nullable: true })
    coverImage: string | null;

    @Column({ type: 'varchar', nullable: true, default: '#000000' })
    color: string | null;

    @Column({ name: 'start_date', type: 'timestamp with time zone', nullable: true })
    startDate: Date | null;

    @Column({ name: 'target_date', type: 'timestamp with time zone', nullable: true })
    targetDate: Date | null;

    @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspace_id', referencedColumnName: 'id' })
    workspace: Workspace;

    @Column({ name: 'workspace_id', type: 'int' })
    workspaceId: number;

    @Column({ name: 'workspace_uuid', type: 'uuid' })
    workspaceUuid: string;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User | null;

    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    createdById: number | null;

    @Column({ name: 'created_by_uuid', type: 'uuid', nullable: true })
    createdByUuid: string | null;

    @OneToMany(() => Task, (task) => task.project)
    tasks: Task[];

    @OneToMany(() => TaskStatus, (status) => status.project)
    statuses: TaskStatus[];

    @OneToMany(() => TaskType, (type) => type.project)
    types: TaskType[];

    @OneToMany(() => TaskPropertyDefinition, (prop) => prop.project)
    propertyDefinitions: TaskPropertyDefinition[];

    @OneToMany(() => ProjectFileLink, (link) => link.project)
    fileLinks: ProjectFileLink[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
