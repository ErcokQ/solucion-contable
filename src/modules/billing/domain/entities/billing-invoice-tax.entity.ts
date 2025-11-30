// // src/modules/billing/domain/entities/billing-invoice-tax.entity.ts
// import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
// import { BillingInvoiceConcept } from './billing-invoice-concept.entity';

// @Entity({ name: 'billing_invoice_taxes' })
// export class BillingInvoiceTax {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @ManyToOne(() => BillingInvoiceConcept, (c) => c.taxes, {
//     onDelete: 'CASCADE',
//   })
//   concept!: BillingInvoiceConcept;

//   @Column('varchar', { length: 10 })
//   impuesto!: '001' | '002' | '003' | string; // ISR/IVA/IEPS

//   @Column('varchar', { length: 10 })
//   tipoFactor!: 'Tasa' | 'Cuota' | 'Exento';

//   @Column('decimal', { precision: 15, scale: 6, nullable: true })
//   tasaCuota!: number | null;

//   // @Column('decimal', { precision: 15, scale: 6 }
//   base!: number;

//   @Column('decimal', { precision: 15, scale: 6 })
//   importe!: number;
// }
