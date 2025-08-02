// src/modules/auth/infrastructure/repositories/typeorm-product-key.repository.ts
import { DataSource } from 'typeorm';
import { injectable } from 'tsyringe';
import { ProductKey } from '@auth/domain/entities/product-key.entity';
import { ProductKeyRepositoryPort } from '@auth/application/ports/product-key-repository.port';
import { AppDataSource } from '@infra/orm/data-source';
import { randomBytes } from 'crypto';

@injectable()
export class TypeOrmProductKeyRepository implements ProductKeyRepositoryPort {
  private repo = (AppDataSource as DataSource).getRepository(ProductKey);

  async generate(): Promise<ProductKey> {
    const key = this.repo.create({
      code: randomBytes(24).toString('hex'),
      used: false,
    });
    return this.repo.save(key);
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  async markAsUsed(id: number) {
    await this.repo.update({ id }, { used: true });
  }
}
