import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';
import { UserAccount } from '../../../account/domain/entities/user-account.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column('varchar', { length: 50, unique: true })
  name!: string;
  @CreateDateColumn({ name: 'created_at' }) createAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updateAt!: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
  })
  /**Relacion con UserAccount */
  @OneToMany(() => UserAccount, (ua) => ua.role)
  userAccounts!: UserAccount[];

  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions!: Permission[];
}
