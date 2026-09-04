import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, Generated } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Permission } from '@moduleAuthorization/entities/permission.entity';
import { UserRoleScope } from '@moduleAuthorization/entities/user-role-scope.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  @Exclude()
  id: number;

  @Column({ name: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_system_defined', default: false })
  isSystemDefined: boolean;

  @ManyToMany(() => Permission, permission => permission.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => UserRoleScope, userRoleScope => userRoleScope.role)
  userRoleScopes: UserRoleScope[];
}
