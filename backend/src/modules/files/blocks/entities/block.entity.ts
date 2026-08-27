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
    @JoinColumn({ name: 'fileId' })
    file: File;

    @Column({ type: 'int' })
    fileId: number;

    @Column({ type: 'uuid', nullable: true })
    fileUuid: string;

    @Column({ type: 'int', nullable: true })
    parentBlockId: number;

    @Column({ type: 'uuid', nullable: true })
    parentBlockUuid: string;

    // Recursive relationship for nested blocks
    @ManyToOne(() => Block, (block) => block.childBlocks, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentBlockId' })
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

    @Column({ type: 'float' })
    orderIndex: number;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column({ type: 'int', nullable: true })
    createdById: number;

    @Column({ type: 'uuid', nullable: true })
    createdByUuid: string;

    @OneToMany(() => BlockRevision, (revision) => revision.block)
    revisions: BlockRevision[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}