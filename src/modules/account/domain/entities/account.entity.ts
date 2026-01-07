// src/modules/account/domain/entities/account.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Company } from './company.entity';
import { UserAccount } from './user-account.entity';

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Nombre comercial de la cuenta: despacho o empresa. */
  @Column('varchar', { length: 150 })
  name!: string;

  /** Plan contratado: ej. 'single', 'multi-10', 'enterprise'. */
  @Column('varchar', { length: 50, default: 'single' })
  plan!: string;

  /** Límite de usuarios permitidos en esta cuenta. */
  @Column('int', { name: 'max_users', default: 3 })
  maxUsers!: number;

  /** Límite de empresas (RFC) permitidos en esta cuenta. */
  @Column('int', { name: 'max_companies', default: 1 })
  maxCompanies!: number;

  /** Para suspender una cuenta sin borrarla. */
  @Column('bool', { default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Company, (c) => c.account)
  companies!: Company[];

  @OneToMany(() => UserAccount, (ua) => ua.account)
  userAccounts!: UserAccount[];
}
