// src/modules/payments/domain/entities/payment-detail.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PaymentHeader } from './payment-header.entity';

@Entity({ name: 'payment_details' })
export class PaymentDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PaymentHeader, (h) => h.detalles, { onDelete: 'CASCADE' })
  paymentHeader!: PaymentHeader;

  /** UUID del CFDI pagado (Relacionado) */
  @Column('char', { length: 36 })
  uuidRelacionado!: string;

  /** Importe pagado contra ese UUID */
  @Column('decimal', { precision: 15, scale: 2 })
  importePagado!: number;

  /** Saldo anterior del documento */
  @Column('decimal', { precision: 15, scale: 2 })
  saldoAnterior!: number;

  /** Saldo insoluto (restante) */
  @Column('decimal', { precision: 15, scale: 2 })
  saldoInsoluto!: number;
}
