import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';

import { AccountRepositoryPort } from '@account/application/ports/account-repository.port';
import { Account } from '@account/domain/entities/account.entity';
import { AppDataSource } from '@infra/orm/data-source';

@injectable()
export class TypeOrmAccountRepository implements AccountRepositoryPort {
  private readonly repo: Repository<Account> =
    AppDataSource.getRepository(Account);

  async findById(id: number): Promise<Account | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(account: Account): Promise<void> {
    await this.repo.save(account);
  }

  findAll(): Promise<Account[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
