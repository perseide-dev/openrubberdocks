import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Generated, BeforeInsert, BeforeUpdate } from 'typeorm';
import { UserType } from '@moduleUsers/enums/users.enum';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  @Exclude()
  id: number;

  @Column({ name: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column()
  username!: string;

  @Column({ unique: true })
  rubberHandle!: string;

  @Column()
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  @Exclude()
  hashedRefreshToken?: string | null;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.INTERNAL,
  })
  type!: UserType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

}
