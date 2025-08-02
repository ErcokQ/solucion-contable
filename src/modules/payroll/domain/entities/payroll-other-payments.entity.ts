import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { PayrollHeader } from './payroll-header.entity';

@Entity({ name: 'payroll_other_payments' })
export class PayrollOtherPayment {
  @PrimaryGeneratedColumn() id!: number;
  @ManyToOne(() => PayrollHeader, (h) => h.otrosPagos, {
    onDelete: 'CASCADE',
  })
  payrollHeader!: PayrollHeader;
  @Column({ length: 15 }) tipoOtroPago!: string;
  @Column({ length: 15 }) clave!: string;
  @Column() concepto!: string;
  @Column('decimal', { precision: 15, scale: 2 }) importe!: number;
}
