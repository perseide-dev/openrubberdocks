import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Block } from '@moduleFiles/blocks/entities/block.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';

@Entity('pages')
export class File {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspace_id', referencedColumnName: 'uuid' })
    workspace: Workspace;

    @Column({ type: 'uuid' })
    workspace_id: string;

    @Column({ type: 'uuid', nullable: true })
    parent_page_id: string;

    // Relación recursiva para páginas hijas/padre
    @ManyToOne(() => File, (file) => file.child_pages, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_page_id' })
    parent_page: File;

    @OneToMany(() => File, (file) => file.parent_page)
    child_pages: File[];

    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar', nullable: true, comment: 'Emoji o URL' })
    icon: string;

    @Column({ type: 'varchar', nullable: true, comment: 'URL' })
    cover_image: string;

    @Column({ type: 'boolean', default: false, comment: 'Clave para el sistema de templates' })
    is_template: boolean;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by', referencedColumnName: 'uuid' })
    createdBy: User;

    @Column({ type: 'uuid', nullable: true })
    created_by: string;

    // Relación con los bloques
    @OneToMany(() => Block, (block) => block.file)
    blocks: Block[];

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}