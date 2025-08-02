// src/modules/auth/domain/entities/product-key.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_keys' })
export class ProductKey {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { length: 64, unique: true })
  code!: string;

  @Column('bool', { default: false })
  used!: boolean;

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
