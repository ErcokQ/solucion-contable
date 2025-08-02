import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { PayrollHeader } from './payroll-header.entity';

@Entity({ name: 'payroll_perceptions' })
export class PayrollPerception {
  @PrimaryGeneratedColumn() id!: number;
  @ManyToOne(() => PayrollHeader, (h) => h.percepciones, {
    onDelete: 'CASCADE',
  })
  payrollHeader!: PayrollHeader;

  @Column({ type: 'varchar', length: 16 }) tipoPercepcion!: string;
  @Column({ type: 'varchar', length: 15 }) clave!: string;
  @Column() concepto!: string;
  @Column('decimal', { precision: 15, scale: 2 }) importeGravado!: number;
  @Column('decimal', { precision: 15, scale: 2 }) importeExento!: number;
}
