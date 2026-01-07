// src/modules/auth/infraestructure/repositories/typeorm-reset-password.repository.ts
import { injectable } from 'tsyringe';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { AppDataSource } from '@infra/orm/data-source';
import { ResetPasswordOrm } from '@infra/orm/entities/reset-password.orm';
import { ResetPasswordRepositoryPort } from '@auth/application/ports/reset-password-repository.port';

@injectable()
export class TypeOrmResetPasswordRepository
  implements ResetPasswordRepositoryPort
{
  private repo: Repository<ResetPasswordOrm> =
    AppDataSource.getRepository(ResetPasswordOrm);

  async create(input: { userId: number; tokenHash: string; expiresAt: Date }) {
    await this.repo.save({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      usedAt: null,
    });
  }

  async findValidByTokenHash(tokenHash: string) {
    return this.repo.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async markUsed(id: number) {
    await this.repo.update({ id }, { usedAt: new Date() });
  }

  async invalidateUserTokens(userId: number) {
    // marca como usados todos los tokens vivos del usuario (opcional)
    await this.repo.update(
      { userId, usedAt: IsNull() },
      { usedAt: new Date() },
    );
  }
}
