// // src/modules/billing/domain/entities/billing-invoice.entity.ts
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   OneToMany,
//   Index,
//   CreateDateColumn,
//   UpdateDateColumn,
// } from 'typeorm';
// import { User } from '@auth/domain/entities/user.entity';
// import { BillingSerie } from './billing-serie.entity';
// import { EmitterConfig } from './emitter-config.entity';
// import { BillingInvoiceConcept } from './billing-invoice-concept.entity';
// import { BillingRelated } from './billing-related.entity';

// export enum BillingStatus {
//   DRAFT = 'DRAFT', // editable
//   READY = 'READY', // validado y listo para timbrar
//   STAMPED = 'STAMPED', // timbrado OK
//   CANCELLED = 'CANCELLED',
//   FAILED = 'FAILED', // intento de timbrado fallido
// }

// @Entity({ name: 'billing_invoices' })
// export class BillingInvoice {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   /** Usuario que creó el borrador */
//   @ManyToOne(() => User, { eager: true })
//   user!: User;

//   /** Config del emisor (RFC, certificados, PAC) */
//   @ManyToOne(() => EmitterConfig, (e) => e.invoices, { eager: true })
//   emisor!: EmitterConfig;

//   /** Control interno de serie/folio antes del timbrado */
//   @ManyToOne(() => BillingSerie, (s) => s.invoices, { nullable: true })
//   serie!: BillingSerie | null;

//   @Index()
//   @Column('varchar', { length: 40, nullable: true })
//   folio!: string | null;

//   // —— Datos del receptor (snapshot para no depender de catálogos externos) ——
//   @Index()
//   @Column('varchar', { length: 13 })
//   rfcReceptor!: string;

//   @Column('varchar', { length: 255 })
//   nombreReceptor!: string;

//   @Column('varchar', { length: 3, default: 'MXN' })
//   moneda!: string;

//   @Column('decimal', { precision: 15, scale: 6, nullable: true })
//   tipoCambio!: number | null;

//   @Column('varchar', { length: 3, nullable: true })
//   formaPago!: string | null; // c_FormaPago

//   @Column('varchar', { length: 3, nullable: true })
//   metodoPago!: string | null; // c_MetodoPago

//   @Column('varchar', { length: 2, default: '01' })
//   usoCfdi!: string; // c_UsoCFDI (p. ej. G01 = '01')

//   @Column('varchar', { length: 10, nullable: true })
//   lugarExpedicion!: string | null; // CP emisor

//   // —— Totales calculados en borrador ——
//   @Column('decimal', { precision: 15, scale: 6, default: 0 })
//   subTotal!: number;

//   @Column('decimal', { precision: 15, scale: 6, default: 0 })
//   descuento!: number;

//   @Column('decimal', { precision: 15, scale: 6, default: 0 })
//   total!: number;

//   @Column({ type: 'enum', enum: BillingStatus, default: BillingStatus.DRAFT })
//   status!: BillingStatus;

//   // —— Resultado del timbrado ——
//   @Index()
//   @Column('char', { length: 36, nullable: true })
//   uuid!: string | null;

//   @Column('date', { nullable: true })
//   fechaTimbrado!: Date | null;

//   @Column('varchar', { length: 255, nullable: true })
//   xmlPath!: string | null;

//   @Column('varchar', { length: 255, nullable: true })
//   pdfPath!: string | null;

//   // —— Relaciones internas del agregado ——
//   @OneToMany(() => BillingInvoiceConcept, (c) => c.invoice, {
//     cascade: true,
//     eager: true,
//     onDelete: 'CASCADE',
//   })
//   concepts!: BillingInvoiceConcept[];

//   @OneToMany(() => BillingRelated, (r) => r.invoice, {
//     cascade: true,
//     onDelete: 'CASCADE',
//   })
//   relatedDocs!: BillingRelated[];

//   // —— Metadatos/archivos previos (render de previsualización) ——
//   @Column('varchar', { length: 255, nullable: true })
//   previewXmlPath!: string | null;

//   @Column('varchar', { length: 255, nullable: true })
//   previewPdfPath!: string | null;

//   @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
//   @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
// }
