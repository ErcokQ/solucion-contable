// src/modules/payments/domain/entities/payment-header.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { PaymentDetail } from './payment-detail.entity';

@Entity({ name: 'payment_headers' })
export class PaymentHeader {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Relación 1-N con el comprobante origen */
  @ManyToOne(() => CfdiHeader, (c) => c.payments, { onDelete: 'CASCADE' })
  cfdiHeader!: CfdiHeader;

  /** Fecha del pago (pago20:Pago/@FechaPago) */
  @Index()
  @Column('date')
  fechaPago!: Date;

  /** Monto total del pago (pago20:Pago/@Monto) */
  @Column('decimal', { precision: 15, scale: 2 })
  monto!: number;

  /** Forma de pago SAT (catálogo c_FormaPago) */
  @Column('varchar', { length: 2 })
  formaPago!: string;

  /** Moneda del pago (default MXN) */
  @Column('varchar', { length: 3, default: 'MXN' })
  moneda!: string;

  /** Tipo de cambio (si la moneda ≠ MXN) */
  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  tipoCambio?: number;

  /** Relación con los documentos relacionados */
  @OneToMany(() => PaymentDetail, (d) => d.paymentHeader, { cascade: true })
  detalles!: PaymentDetail[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
