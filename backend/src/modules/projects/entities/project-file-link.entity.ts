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
import { Project } from '@moduleProjects/entities/project.entity';
import { File } from '@moduleFiles/manager/entities/file.entity';

@Entity('project_file_links')
export class ProjectFileLink {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Project, (project) => project.fileLinks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
    project: Project;

    @Column({ name: 'project_id', type: 'int' })
    projectId: number;

    @Column({ name: 'project_uuid', type: 'uuid' })
    projectUuid: string;

    @ManyToOne(() => File, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'file_id', referencedColumnName: 'id' })
    file: File;

    @Column({ name: 'file_id', type: 'int' })
    fileId: number;

    @Column({ name: 'file_uuid', type: 'uuid' })
    fileUuid: string;

    @CreateDateColumn({ name: 'attached_at' })
    attachedAt: Date;
}
