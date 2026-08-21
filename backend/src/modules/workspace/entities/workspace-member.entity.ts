import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '@moduleUsers/entities/user.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';

@Entity('workspace_members')
export class WorkspaceMember {
    @PrimaryGeneratedColumn('increment')
    id: number

    @ManyToOne(() => User, (user) => user.workspaceMemberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'int' })
    userId: number;

    @ManyToOne(() => Workspace, (workspace) => workspace.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workspaceId' })
    workspace: Workspace;

    @Column({ type: 'int' })
    workspaceId: number;

    @CreateDateColumn()
    joinedAt: Date;

}