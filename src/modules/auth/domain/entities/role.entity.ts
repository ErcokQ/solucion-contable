import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ length: 50, unique: true })
  name!: string;
  @CreateDateColumn({ name: 'created_at' }) createAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updateAt!: Date;

  @OneToMany(() => UserRole, (ur) => ur.role) userRoles!: UserRole[];
}
