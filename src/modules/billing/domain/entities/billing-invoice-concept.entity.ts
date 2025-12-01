// src/modules/billing/domain/entities/billing-invoice-concept.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
} from 'typeorm';
import { BillingInvoice } from './billing-invoice.entity';
import { BillingInvoiceTax } from './billing-invoice-tax.entity';

@Entity({ name: 'billing_invoice_concepts' })
export class BillingInvoiceConcept {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => BillingInvoice, (i) => i.concepts, { onDelete: 'CASCADE' })
  invoice!: BillingInvoice;

  @Column('varchar', { length: 8 })
  claveProdserv!: string; // c_ClaveProdServ

  @Column('varchar', { length: 5 })
  claveUnidad!: string; // c_ClaveUnidad

  @Column('varchar', { length: 25, nullable: true })
  unidad!: string | null;

  @Column('text')
  descripcion!: string;

  @Column('decimal', { precision: 15, scale: 6 })
  cantidad!: number;

  @Column('decimal', { precision: 15, scale: 6 })
  valorUnitario!: number;

  @Column('decimal', { precision: 15, scale: 6, default: 0 })
  descuento!: number;

  @Column('decimal', { precision: 15, scale: 6 })
  importe!: number;

  @OneToMany(() => BillingInvoiceTax, (t) => t.concept, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  taxes!: BillingInvoiceTax[];
}
