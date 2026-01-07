// src/modules/auth/infraestructure/repositories/typeorm-email-verification.repository.ts
import { injectable } from 'tsyringe';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { AppDataSource } from '@infra/orm/data-source';
import { EmailVerificationTokenOrm } from '@infra/orm/entities/email-verification-token.orm';
import { EmailVerificationRepositoryPort } from '@auth/application/ports/email-verification-repository.port';

@injectable()
export class TypeOrmEmailVerificationRepository
  implements EmailVerificationRepositoryPort
{
  private repo: Repository<EmailVerificationTokenOrm> =
    AppDataSource.getRepository(EmailVerificationTokenOrm);

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
    await this.repo.update(
      { userId, usedAt: IsNull() },
      { usedAt: new Date() },
    );
  }
}
