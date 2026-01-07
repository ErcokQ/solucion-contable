// src/modules/account/domain/entities/company.entity.ts
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

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  /** FK explícita para queries directas. */
  @Column('int', { name: 'account_id' })
  accountId!: number;

  /** Cuenta a la que pertenece esta empresa. */
  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  /** Nombre visible de la empresa. */
  @Column('varchar', { length: 200 })
  name!: string;

  /** RFC de la empresa (en México máximo 13 caracteres). */
  @Column('varchar', { length: 13 })
  rfc!: string;

  /** Opcional: régimen fiscal (código del SAT). */
  @Column('varchar', { length: 5, name: 'tax_regime', nullable: true })
  taxRegime?: string;

  /** Marcar empresa como inactiva dentro del account sin borrarla. */
  @Column('bool', { default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
