import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { User } from '@auth/domain/entities/user.entity';
import { CfdiConcept } from './cfdi-concept.entity';
import { PaymentHeader } from '@payments/domain/entities/payment-header.entity';
import { PayrollHeader } from '@payroll/domain/entities/payroll-header.entity';

@Entity({ name: 'cfdi_headers' })
export class CfdiHeader {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column('char', { length: 36, unique: true })
  uuid!: string;

  // RFCs
  @Column('varchar', { length: 13 })
  rfcEmisor!: string;

  @Column('varchar', { length: 13 })
  rfcReceptor!: string;

  // Serie / Folio
  @Column('varchar', { length: 20, nullable: true })
  serie?: string;

  @Column('varchar', { length: 20, nullable: true })
  folio?: string;

  // Fechas y totales
  @Column('date')
  fecha!: Date;

  @Column('decimal', { precision: 15, scale: 2 })
  subTotal!: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  descuento!: number;

  @Column('decimal', { precision: 15, scale: 2 })
  total!: number;

  // Moneda y tipo de cambio
  @Column('varchar', { length: 3 })
  moneda!: string;

  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  tipoCambio?: number;

  // Formas y métodos de pago
  @Column('varchar', { length: 20, nullable: true })
  formaPago?: string;

  @Column('varchar', { length: 20, nullable: true })
  metodoPago?: string;

  // Lugar expedición
  @Column('varchar', { length: 5, nullable: true })
  lugarExpedicion?: string;

  /** Ruta o URL del XML */
  @Column('varchar', { length: 255 })
  xmlPath!: string;

  @Column('varchar', { length: 255, nullable: true })
  nombreEmisor?: string;

  @Column('varchar', { length: 255, nullable: true })
  nombreReceptor?: string;

  @Column('enum', {
    enum: ['PENDING', 'PROCESSING', 'PARSED', 'ERROR'],
    default: 'PENDING',
  })
  status!: 'PENDING' | 'PROCESSING' | 'PARSED' | 'ERROR';

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => CfdiConcept, (c) => c.cfdiHeader, { cascade: true })
  concepts!: CfdiConcept[];

  @OneToMany(() => PaymentHeader, (p) => p.cfdiHeader)
  payments!: PaymentHeader[];

  @OneToMany(() => PayrollHeader, (p) => p.cfdiHeader)
  payrolls!: PayrollHeader[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
