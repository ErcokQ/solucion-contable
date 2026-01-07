// src/infraestructure/orm/entities/email-verification-token.orm.ts
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

@Entity({ name: 'email_verification_tokens' })
export class EmailVerificationTokenOrm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int', { name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

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
