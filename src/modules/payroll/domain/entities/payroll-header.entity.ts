// modules/payroll/domain/entities/payroll-header.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { PayrollPerception } from './payroll-perceptions.entity';
import { PayrollDeduction } from './payroll-deductions.entity';
import { PayrollOtherPayment } from './payroll-other-payments.entity';
import { PayrollIncapacity } from './payroll-incapacities.entity';

@Entity({ name: 'payroll_headers' })
export class PayrollHeader {
  @PrimaryGeneratedColumn() id!: number;

  @ManyToOne(() => CfdiHeader, (c) => c.payrolls, { onDelete: 'CASCADE' })
  cfdiHeader!: CfdiHeader;

  @Column({ length: 1 }) tipoNomina!: 'O' | 'E';
  @Column('date') fechaPago!: Date;
  @Column('date') fechaInicialPago!: Date;
  @Column('date') fechaFinalPago!: Date;
  @Column('int') diasPagados!: number;
  @Column('decimal', { precision: 15, scale: 2 }) totalPercepciones!: number;
  @Column('decimal', { precision: 15, scale: 2 }) totalDeducciones!: number;
  @Column('decimal', { precision: 15, scale: 2 }) totalOtrosPagos!: number;

  @OneToMany(() => PayrollPerception, (p) => p.payrollHeader, { cascade: true })
  percepciones!: PayrollPerception[];
  @OneToMany(() => PayrollDeduction, (d) => d.payrollHeader, { cascade: true })
  deducciones!: PayrollDeduction[];
  @OneToMany(() => PayrollOtherPayment, (o) => o.payrollHeader, {
    cascade: true,
  })
  otrosPagos!: PayrollOtherPayment[];
  @OneToMany(() => PayrollIncapacity, (i) => i.payrollHeader, { cascade: true })
  incapacidades!: PayrollIncapacity[];

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
