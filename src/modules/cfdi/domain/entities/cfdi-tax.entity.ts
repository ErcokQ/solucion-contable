// src/modules/cfdi/domain/entities/cfdi-tax.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { CfdiConcept } from './cfdi-concept.entity';

@Entity({ name: 'cfdi_taxes' })
export class CfdiTax {
  @PrimaryGeneratedColumn() id!: number;

  @ManyToOne(() => CfdiConcept, (concept) => concept.taxes, {
    onDelete: 'CASCADE',
  })
  concept!: CfdiConcept;

  @Column({ type: 'enum', enum: ['TRASLADADO', 'RETENIDO'] })
  tipo!: 'TRASLADADO' | 'RETENIDO';

  @Column({ type: 'varchar', length: 5 })
  impuesto!: string;

  @Column({ name: 'tipo_factor', type: 'varchar', length: 5 })
  tipoFactor!: string;

  @Column({
    name: 'tasa_cuota',
    type: 'decimal',
    precision: 12,
    scale: 6,
    nullable: true,
  })
  tasaCuota?: number;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  importe!: number;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  base!: number;
}
