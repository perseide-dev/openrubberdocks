import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Block } from './block.entity';
import { User } from '@moduleUsers/entities/user.entity';

@Entity('block_revisions')
export class BlockRevision {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Block, (block) => block.revisions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'block_id' })
    block: Block;

    @Column({ type: 'uuid' })
    block_id: string;

    @Column({ type: 'jsonb', default: {}, comment: 'Snapshot de las propiedades del bloque en esta revisión' })
    properties: Record<string, any>;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by', referencedColumnName: 'uuid' })
    createdBy: User;

    @Column({ type: 'uuid', nullable: true })
    created_by: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}
