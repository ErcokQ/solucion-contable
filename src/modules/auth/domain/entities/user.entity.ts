import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 120, unique: true })
  email!: string;

  @Column({ length: 60 })
  passwordHash!: string; // hash bcrypt

  @Column({ length: 120 })
  fullName!: string;

  @Column({ length: 60, unique: true })
  username!: string; // login alternativo

  @Column({ length: 30, default: 'local' })
  provider!: 'local' | 'google'; // para OAuth

  @Column({ nullable: true })
  avatar?: string; // URL a la imagen

  @Column({ default: true })
  activo!: boolean; // soft-disable

  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;

  /* ---------- relación N-a-N con Role ---------- */
  @ManyToMany(() => Role, (role) => role.users, { cascade: false })
  @JoinTable({
    name: 'user_roles', // nombre de la tabla puente
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: Role[]; // roles asignados al usuario
}
