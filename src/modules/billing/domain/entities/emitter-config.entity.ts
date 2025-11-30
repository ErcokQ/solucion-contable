// // src/modules/billing/domain/entities/emitter-config.entity.ts
// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   OneToMany,
//   Unique,
//   Index,
// } from 'typeorm';
// import { BillingInvoice } from './billing-invoice.entity';

// @Entity({ name: 'emitter_configs' })
// @Unique(['rfc'])
// export class EmitterConfig {
//   @PrimaryGeneratedColumn()
//   id!: number;

//   @Index()
//   @Column('varchar', { length: 13 })
//   rfc!: string;

//   @Column('varchar', { length: 255 })
//   razonSocial!: string;

//   // Rutas a certificados/llave; idealmente van a un vault/secret manager en prod
//   @Column('varchar', { length: 255 })
//   cerPath!: string;

//   @Column('varchar', { length: 255 })
//   keyPath!: string;

//   @Column('varchar', { length: 255 })
//   keyPassword!: string;

//   // Credenciales PAC (proveedor pluggable)
//   @Column('varchar', { length: 100 })
//   pacProvider!: string; // ej. 'finkok', 'multifacturas', etc.

//   @Column('varchar', { length: 255 })
//   pacUser!: string;

//   @Column('varchar', { length: 255 })
//   pacPassword!: string;

//   @OneToMany(() => BillingInvoice, (i) => i.emisor)
//   invoices!: BillingInvoice[];
// }
