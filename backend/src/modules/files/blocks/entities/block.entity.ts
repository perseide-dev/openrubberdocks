import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Generated,
    OneToMany
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { File } from '@moduleFiles/manager/entities/file.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { BlockType } from '../enums/block-type.enum';
import { BlockRevision } from './block-revision.entity';

@Entity('blocks')
export class Block {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => File, (file) => file.blocks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'file_id' })
    file: File;

    @Column({ name: 'file_id', type: 'int' })
    fileId: number;

    @Column({ name: 'file_uuid', type: 'uuid', nullable: true })
    fileUuid: string;

    @Column({ name: 'parent_block_id', type: 'int', nullable: true })
    parentBlockId: number;

    @Column({ name: 'parent_block_uuid', type: 'uuid', nullable: true })
    parentBlockUuid: string;

    // Recursive relationship for nested blocks
    @ManyToOne(() => Block, (block) => block.childBlocks, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_block_id' })
    parentBlock: Block;

    @OneToMany(() => Block, (block) => block.parentBlock)
    childBlocks: Block[];

    @Column({
        type: 'enum',
        enum: BlockType,
        default: BlockType.TEXT,
    })
    type: BlockType;

    @Column({ type: 'jsonb', nullable: true })
    properties: Record<string, any>;

    @Column({ name: 'order_index', type: 'float' })
    orderIndex: number;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    createdById: number;

    @Column({ name: 'created_by_uuid', type: 'uuid', nullable: true })
    createdByUuid: string;

    @OneToMany(() => BlockRevision, (revision) => revision.block)
    revisions: BlockRevision[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}