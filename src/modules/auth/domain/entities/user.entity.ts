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

  @Column('varchar', { length: 120, unique: true })
  email!: string;

  @Column('varchar', { length: 60 })
  passwordHash!: string; // hash bcrypt

  @Column('varchar', { length: 120 })
  fullName!: string;

  @Column('varchar', { length: 60, unique: true })
  username!: string; // login alternativo

  @Column('varchar', { length: 30, default: 'local' })
  provider!: 'local' | 'google'; // para OAuth

  @Column('varchar', { nullable: true })
  avatar?: string; // URL a la imagen

  @Column('bool', { default: true })
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

  /* ====================================================== */
  /*  F Á B R I C A                                          */
  /* ====================================================== */

  /** Construye un usuario nuevo listo para persistir. */
  static create(
    fullName: string,
    email: string,
    username: string,
    passwordHash: string,
    provider: 'local' | 'google' = 'local',
  ): User {
    const user = new User();
    user.fullName = fullName;
    user.email = email;
    user.username = username;
    user.passwordHash = passwordHash;
    user.provider = provider;
    user.activo = true;
    user.roles = [];
    return user;
  }
}
