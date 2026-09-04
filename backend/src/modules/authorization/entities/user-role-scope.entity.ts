import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Generated } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '@moduleUsers/entities/user.entity';
import { Role } from '@moduleAuthorization/entities/role.entity';
import { Workspace } from '@moduleWorkspace/entities/workspace.entity';

@Entity('user_role_scopes')
export class UserRoleScope {
  @PrimaryGeneratedColumn('increment')
  @Exclude()
  id: number;

  @Column({ name: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @Column({ name: 'workspace_id', type: 'int', nullable: true })
  workspaceId: number | null;

  // We add squadId as nullable in case Squad scoping is required in the future
  @Column({ name: 'squad_id', type: 'int', nullable: true })
  squadId: number | null;
}
