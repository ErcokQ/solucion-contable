import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';

import { CompanyRepositoryPort } from '@account/application/ports/company-repository.port';
import { Company } from '@account/domain/entities/company.entity';
import { AppDataSource } from '@infra/orm/data-source';

@injectable()
export class TypeOrmCompanyRepository implements CompanyRepositoryPort {
  private readonly repo: Repository<Company> =
    AppDataSource.getRepository(Company);

  async findById(id: number): Promise<Company | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(company: Company): Promise<void> {
    await this.repo.save(company);
  }

  async findByAccountId(accountId: number): Promise<Company[]> {
    return this.repo.find({ where: { accountId } });
  }
}
