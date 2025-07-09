import { Role } from '@auth/domain/entities/role.entity';
/**
 * Obtiene el nombre del rol
 */
export interface RoleRepositoryPort {
  findByName(name: string): Promise<Role | null>;
}
