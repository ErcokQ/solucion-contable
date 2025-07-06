import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@/modules/auth/domain/entities/user.entity';

@Entity({ name: 'reset_passwords' })
export class ResetPasswordOrm {
  @PrimaryGeneratedColumn() id!: number;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 64, unique: true }) token!: string;
  @Column() expiresAt!: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
