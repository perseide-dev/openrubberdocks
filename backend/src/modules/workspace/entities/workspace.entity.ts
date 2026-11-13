import { Entity, Column, PrimaryGeneratedColumn, Generated, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { Exclude } from 'class-transformer'
import { WorkspaceMember } from '@moduleWorkspace/entities/workspace-member.entity';
import { User } from '@moduleUsers/entities/user.entity';

@Entity('workspace')
export class Workspace {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Column({ name: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        name: 'storage_quota_bytes',
        type: 'bigint',
        default: 524288000,
        transformer: {
            to: (value?: number) => (value !== undefined && value !== null ? String(value) : '524288000'),
            from: (value?: string | number) => (value !== undefined && value !== null ? Number(value) : 524288000),
        },
    })
    storageQuotaBytes: number;

    @OneToMany(() => WorkspaceMember, (member) => member.workspace)
    members: WorkspaceMember[];

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy: User;

    @Column({ name: 'created_by_id', type: 'int', nullable: true })
    createdById?: number | null;

    @Column({ name: 'created_by_uuid', type: 'uuid' })
    createdByUUID: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}