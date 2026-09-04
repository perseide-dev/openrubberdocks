import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Generated
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';

@Entity('pages')
export class File {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspace_id', referencedColumnName: 'id' })
    workspace: Workspace;

    @Column({ name: 'workspace_id', type: 'int' })
    workspaceId: number;

    @Column({ name: 'workspace_uuid', type: 'uuid', nullable: true })
    workspaceUuid: string;

    @Column({ name: 'parent_page_id', type: 'int', nullable: true })
    parentPageId: number;

    @Column({ name: 'parent_page_uuid', type: 'uuid', nullable: true })
    parentPageUuid: string;

    // Relación recursiva para páginas hijas/padre
    @ManyToOne(() => File, (file) => file.childPages, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_page_id' })
    parentPage: File;

    @OneToMany(() => File, (file) => file.parentPage)
    childPages: File[];

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar', nullable: true, comment: 'Emoji o URL' })
    icon: string;

    @Column({ type: 'varchar', nullable: true, comment: 'URL' })
    coverImage: string;

    @Column({ type: 'boolean', default: false, comment: 'Clave para el sistema de templates' })
    isTemplate: boolean;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    createdById: number;

    @Column({ name: 'created_by_uuid', type: 'uuid', nullable: true })
    createdByUuid: string;

    // Relación con los bloques
    @OneToMany(() => Block, (block) => block.file)
    blocks: Block[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}