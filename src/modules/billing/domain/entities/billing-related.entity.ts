// // src/modules/billing/domain/entities/billing-related.entity.ts
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   Column,
//   Index,
// } from 'typeorm';
// import { BillingInvoice } from './billing-invoice.entity';

// @Entity({ name: 'billing_related' })
// export class BillingRelated {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @ManyToOne(() => BillingInvoice, (i) => i.relatedDocs, {
//     onDelete: 'CASCADE',
//   })
//   invoice!: BillingInvoice;

//   @Column('varchar', { length: 2 })
//   tipoRelacion!: string; // c_TipoRelacion (01, 04, 07, etc.)

//   @Index()
//   @Column('char', { length: 36 })
//   uuidRelacionado!: string;
// }
