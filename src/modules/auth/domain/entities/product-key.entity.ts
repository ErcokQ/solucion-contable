// src/modules/auth/domain/entities/product-key.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '@account/domain/entities/account.entity'; // ajusta el path a tu alias real

export type ProductKeyType = 'account' | 'user';

@Entity({ name: 'product_keys' })
export class ProductKey {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 64, unique: true })
  code!: string;

  /**
   * Tipo de clave:
   * - 'account' → crea/activa una cuenta (suscripción).
   * - 'user'    → invita/da de alta usuarios dentro de una cuenta existente.
   */
  @Column('varchar', { length: 20 })
  type!: ProductKeyType;

  /**
   * Cuenta a la que está asociada la clave.
   * - null en claves de tipo 'account' antes de usarse.
   * - no null en claves de tipo 'user' (siempre ligadas a un account).
   * - opcionalmente, en claves de 'account' ya redimidas, puedes guardar
   *   el accountId que se creó con esta clave.
   */
  @Column('int', { name: 'account_id', nullable: true })
  accountId!: number | null;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account?: Account | null;

  /**
   * Número máximo de usos de esta clave.
   * - Para claves 'account' normalmente 1.
   * - Para claves 'user' puede ser > 1 (ej. invitar hasta N usuarios).
   */
  @Column('int', { name: 'max_uses', default: 1 })
  maxUses!: number;

  /** Cuántas veces se ha usado ya esta clave. */
  @Column('int', { name: 'used_count', default: 0 })
  usedCount!: number;

  /**
   * Marca rápida de “ya no se debe usar”.
   * Puedes considerarla derivada de `usedCount >= maxUses`, pero la
   * dejamos para consultas rápidas y compatibilidad con tu modelo actual.
   */
  @Column('bool', { default: false })
  used!: boolean;

  /** Fecha de expiración opcional. */
  @Column('timestamp', { name: 'expires_at', nullable: true })
  expiresAt?: Date | null;

  @Column('int', { name: 'created_by_user_id', nullable: true })
  createdByUserId!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
