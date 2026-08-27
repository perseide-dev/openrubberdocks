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
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column()
  roleId: number;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ nullable: true })
  workspaceId: number;

  // We add squadId as nullable in case Squad scoping is required in the future
  @Column({ nullable: true })
  squadId: number;
}
