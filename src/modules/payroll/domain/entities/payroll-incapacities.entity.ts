import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { PayrollHeader } from './payroll-header.entity';

@Entity({ name: 'payroll_incapacities' })
export class PayrollIncapacity {
  @PrimaryGeneratedColumn() id!: number;
  @ManyToOne(() => PayrollHeader, (h) => h.incapacidades, {
    onDelete: 'CASCADE',
  })
  payrollHeader!: PayrollHeader;
  @Column('varchar', { length: 15 })
  tipoIncapacidad!: string;
  @Column('int')
  diasIncapacidad!: number;
  @Column('decimal', { precision: 15, scale: 2 })
  importe!: number;
}
