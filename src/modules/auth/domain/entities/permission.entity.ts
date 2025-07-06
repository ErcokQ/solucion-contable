import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ length: 80, unique: true }) code!: string;
  @Column({ length: 120, nullable: true }) description?: string;
  @ManyToMany(() => Role, (r) => r.permissions)
  roles!: Role[];
}
