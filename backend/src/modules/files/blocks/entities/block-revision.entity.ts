import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Generated
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Block } from './block.entity';
import { User } from '@moduleUsers/entities/user.entity';

@Entity('block_revisions')
export class BlockRevision {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => Block, (block) => block.revisions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'blockId' })
    block: Block;

    @Column({ type: 'int' })
    blockId: number;

    @Column({ type: 'uuid', nullable: true })
    blockUuid: string;

    @Column({ type: 'jsonb', nullable: true })
    properties: Record<string, any>;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'createdById' })
    createdBy: User;

    @Column({ type: 'int', nullable: true })
    createdById: number;

    @Column({ type: 'uuid', nullable: true })
    createdByUuid: string;

    @CreateDateColumn()
    createdAt: Date;
}
