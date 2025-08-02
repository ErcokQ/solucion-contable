// src/modules/cfdi/domain/entities/cfdi-concept.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CfdiHeader } from './cfdi.entity';
import { CfdiTax } from './cfdi-tax.entity';

@Entity({ name: 'cfdi_concepts' })
export class CfdiConcept {
  @PrimaryGeneratedColumn() id!: number;

  @ManyToOne(() => CfdiHeader, (header) => header.concepts, {
    onDelete: 'CASCADE',
  })
  cfdiHeader!: CfdiHeader;

  @Column({ name: 'clave_prodserv', type: 'varchar', length: 25 })
  claveProdServ!: string;

  @Column({
    name: 'no_identificacion',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  noIdentificacion?: string;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  cantidad!: number;

  @Column({ name: 'valor_unitario', type: 'decimal', precision: 15, scale: 6 })
  valorUnitario!: number;

  @Column({ type: 'decimal', precision: 15, scale: 6, default: 0 })
  descuento!: number;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  importe!: number;

  @Column({ name: 'descripcion', type: 'varchar', length: 1000 })
  descripcion!: string;

  @OneToMany(() => CfdiTax, (t) => t.concept, { cascade: true })
  taxes!: CfdiTax[];
}
