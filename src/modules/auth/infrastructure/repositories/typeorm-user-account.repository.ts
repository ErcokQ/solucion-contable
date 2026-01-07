// src/modules/auth/infraestructure/repositories/typeorm-user-account.repository.ts
import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';

import { UserAccountRepositoryPort } from '@auth/application/ports/user-account-repository.port';
import { UserAccount } from '@account/domain/entities/user-account.entity';
import { AppDataSource } from '@infra/orm/data-source';

@injectable()
export class TypeOrmUserAccountRepository implements UserAccountRepositoryPort {
  private readonly repo: Repository<UserAccount> =
    AppDataSource.getRepository(UserAccount);

  async findByUserId(userId: number): Promise<
    Array<{
      accountId: number;
      accountName: string;
    }>
  > {
    const rows = await this.repo.find({
      where: {
        userId,
        // opcional pero sano: sólo cuentas activas
        account: { active: true },
      },
      relations: ['account'],
    });

    return rows.map((ua) => ({
      accountId: ua.accountId,
      accountName: ua.account.name,
    }));
  }

  async createLink(params: {
    userId: number;
    accountId: number;
    roleId: number;
    isOwner: boolean;
  }): Promise<void> {
    const { userId, accountId, roleId, isOwner } = params;

    const link = this.repo.create({
      userId,
      accountId,
      roleId,
      isOwner,
    });

    await this.repo.save(link);
  }

  async findOwnersByAccountId(accountId: number): Promise<UserAccount[]> {
    return this.repo.find({
      where: { accountId, isOwner: true },
    });
  }

  async countByAccountId(accountId: number): Promise<number> {
    return this.repo.count({ where: { accountId } });
  }
}
