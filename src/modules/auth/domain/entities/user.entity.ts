import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120, unique: true })
  email!: string;

  @Column({ length: 60 })
  password!: string; // hash bcrypt

  @Column({ length: 120 })
  fullName!: string;

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;

  @OneToMany(() => UserRole, (ur) => ur.user) userRoles!: UserRole[];
}
