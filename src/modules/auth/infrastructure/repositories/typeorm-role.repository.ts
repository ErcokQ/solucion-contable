import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { Role } from '@auth/domain/entities/role.entity';
import { AppDataSource } from '@infra/orm/data-source';
import { RoleRepositoryPort } from '@auth/application/ports/role-repository.port';

@injectable()
export class TypeOrmRoleRepository implements RoleRepositoryPort {
  private repo: Repository<Role> = AppDataSource.getRepository(Role);

  findByName(name: string) {
    return this.repo.findOne({ where: { name } });
  }
}
