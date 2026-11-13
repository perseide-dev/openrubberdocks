import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';
import { User } from '@moduleUsers/entities/user.entity';
import { StorageDriverType } from '@moduleFiles/storage/enums/storage-driver.enum';

@Entity('storage_attachments')
export class StorageAttachment {
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
    @Exclude()
    workspaceId: number;

    @Column({ name: 'workspace_uuid', type: 'uuid' })
    workspaceUuid: string;

    @Column({ name: 'file_uuid', type: 'uuid', nullable: true })
    fileUuid: string | null;

    @Column({ name: 'original_name', type: 'varchar' })
    originalName: string;

    @Column({ name: 'storage_key', type: 'varchar', unique: true })
    @Exclude()
    storageKey: string;

    @Column({
        name: 'driver',
        type: 'varchar',
        default: StorageDriverType.LOCAL,
    })
    driver: StorageDriverType;

    @Column({ name: 'mime_type', type: 'varchar' })
    mimeType: string;

    @Column({
        name: 'size_bytes',
        type: 'bigint',
        transformer: {
            to: (value: number) => String(value ?? 0),
            from: (value: string | number) => Number(value ?? 0),
        },
    })
    sizeBytes: number;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    @Exclude()
    createdById: number | null;

    @Column({ name: 'created_by_uuid', type: 'uuid', nullable: true })
    createdByUuid: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
