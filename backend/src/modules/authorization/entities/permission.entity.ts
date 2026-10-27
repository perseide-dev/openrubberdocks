import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, Generated } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '@moduleAuthorization/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('increment')
  @Exclude()
  id: number;

  @Column({ name: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ unique: true })
  action: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
