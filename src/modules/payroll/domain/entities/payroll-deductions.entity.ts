import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { PayrollHeader } from './payroll-header.entity';

@Entity({ name: 'payroll_deductions' })
export class PayrollDeduction {
  @PrimaryGeneratedColumn() id!: number;
  @ManyToOne(() => PayrollHeader, (h) => h.deducciones, {
    onDelete: 'CASCADE',
  })
  payrollHeader!: PayrollHeader;

  @Column({ length: 15 }) tipoDeduccion!: string;
  @Column({ length: 15 }) clave!: string;
  @Column() concepto!: string;
  @Column('decimal', { precision: 15, scale: 2 }) importe!: number;
}
