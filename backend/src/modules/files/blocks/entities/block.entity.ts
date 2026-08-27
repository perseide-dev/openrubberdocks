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
import { File } from '@moduleFiles/manager/entities/file.entity';
import { BlockRevision } from './block-revision.entity';

@Entity('blocks')
export class Block {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    page_id: string;

    @ManyToOne(() => File, (file) => file.blocks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'page_id' })
    file: File;

    @Column({ type: 'uuid', nullable: true })
    parent_block_id: string;

    // Relación recursiva para anidar bloques (ej. columnas o listas)
    @ManyToOne(() => Block, (block) => block.child_blocks, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_block_id' })
    parent_block: Block;

    @OneToMany(() => Block, (block) => block.parent_block)
    child_blocks: Block[];

    @Column({ type: 'varchar', comment: 'markdown, h1, image, todo, table, code...' })
    type: string;

    @Column({ type: 'jsonb', default: {}, comment: 'Atributos dinámicos del bloque' })
    properties: Record<string, any>;

    @Column({ type: 'float', comment: 'Para drag and drop' })
    order_index: number;

    @OneToMany(() => BlockRevision, (revision) => revision.block)
    revisions: BlockRevision[];

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}