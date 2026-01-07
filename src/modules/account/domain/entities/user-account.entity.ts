// src/modules/account/domain/entities/user-account.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { User } from '@auth/domain/entities/user.entity';
import { Role } from '@auth/domain/entities/role.entity';

@Entity({ name: 'user_accounts' })
export class UserAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int', { name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column('int', { name: 'account_id' })
  accountId!: number;

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @Column('int', { name: 'role_id' })
  roleId!: number;

  @ManyToOne(() => Role, { nullable: false })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column('bool', { name: 'is_owner', default: false })
  isOwner!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
