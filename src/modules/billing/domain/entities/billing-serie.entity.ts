// src/modules/billing/domain/entities/billing-serie.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { BillingInvoice } from './billing-invoice.entity';

@Entity({ name: 'billing_series' })
@Unique(['emisorRfc', 'serie'])
export class BillingSerie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column('varchar', { length: 13 })
  emisorRfc!: string;

  @Column('varchar', { length: 25 })
  serie!: string;

  @Column('bigint', { default: 1 })
  nextFolio!: number;

  @Column('bool', { default: true })
  activo!: boolean;

  @OneToMany(() => BillingInvoice, (i) => i.serie)
  invoices!: BillingInvoice[];
}
