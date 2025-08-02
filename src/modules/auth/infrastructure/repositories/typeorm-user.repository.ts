// src/modules/auth/infraestructure/repositories/typeorm-user.repository.ts
import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';

import { User } from '@auth/domain/entities/user.entity';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { ApiError } from '@shared/error/ApiError';
import { AppDataSource } from '@infra/orm/data-source';

@injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  private readonly repo: Repository<User> = AppDataSource.getRepository(User);

  /* ------------------------ consultores ------------------------ */

  existsByEmail(email: string) {
    return this.repo.exist({ where: { email } });
  }

  existsByUsername(username: string) {
    return this.repo.exist({ where: { username } });
  }

  findByLogin(login: string) {
    return this.repo.findOne({
      where: [{ email: login }, { username: login }],
      relations: ['roles'],
    });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['roles'] });
  }

  /* ------------------------ mutadores -------------------------- */

  async save(user: User): Promise<void> {
    try {
      await this.repo.save(user);
    } catch (err: unknown) {
      if (isDuplicate(err)) throw new ApiError(409, 'EMAIL_OR_USERNAME_EXISTS');
      throw err;
    }
  }
}

/* ---------- type guard para evitar any ---------- */

function isDuplicate(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error && // property check
    typeof (error as { code: unknown }).code === 'string' &&
    ((error as { code: string }).code === 'ER_DUP_ENTRY' ||
      (error as { code: string }).code === '23505')
  );
}
