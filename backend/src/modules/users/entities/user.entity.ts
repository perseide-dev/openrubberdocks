import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm';
import { UserType } from '@moduleUsers/enums/users.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'uuid', unique: true })
  @Generated('uuid')
  uuid: number;

  @Column()
  username: string;

  @Column({ unique: true })
  rubberHandle: string;

  @Column()
  password?: string;

  @Column({ nullable: true })
  hashedRefreshToken?: string | null;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.INTERNAL,
  })
  type: UserType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
