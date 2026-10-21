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
import { File } from '@moduleFiles/manager/entities/file.entity';
import { User } from '@moduleUsers/entities/user.entity';

@Entity('file_revisions')
export class FileRevision {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @ManyToOne(() => File, (file) => file.revisions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'file_id' })
    file: File;

    @Column({ name: 'file_id', type: 'int' })
    fileId: number;

    @Column({ name: 'file_uuid', type: 'uuid' })
    fileUuid: string;

    @Column({ type: 'varchar' })
    title: string;

    @Column({ name: 'blocks_snapshot', type: 'jsonb', default: [] })
    blocksSnapshot: Array<{
        uuid?: string;
        type: string;
        orderIndex: number;
        properties: Record<string, any>;
    }>;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    createdById: number;

    @Column({ name: 'created_by_uuid', type: 'uuid', nullable: true })
    createdByUuid: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
