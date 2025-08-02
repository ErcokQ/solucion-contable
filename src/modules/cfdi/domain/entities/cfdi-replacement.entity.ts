// src/modules/cfdi/domain/entities/cfdi-replacement.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { CfdiHeader } from './cfdi.entity';

@Entity({ name: 'cfdi_replacements' })
export class CfdiReplacement {
  @PrimaryGeneratedColumn()
  id!: number;

  /** CFDI que sustituye (nuevo) */
  @ManyToOne(() => CfdiHeader, { onDelete: 'CASCADE' })
  nuevo!: CfdiHeader;

  /** UUID del CFDI sustituido */
  @Column('char', { length: 36 })
  uuidReemplazado!: string;

  /** TipoRelación SAT (p. ej. "04") */
  @Column('varchar', { length: 2 })
  tipoRelacion!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
