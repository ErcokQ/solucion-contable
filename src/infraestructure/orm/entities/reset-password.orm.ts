// src/infrastructure/orm/entities-infra/reset-password.orm.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '@auth/domain/entities/user.entity';

@Entity({ name: 'reset_passwords' })
export class ResetPasswordOrm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int', { name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // ✅ guardamos hash (no token en claro)
  @Index({ unique: true })
  @Column({ name: 'token_hash', length: 64 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt!: Date;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
