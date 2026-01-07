// src/modules/auth/infrastructure/repositories/typeorm-product-key.repository.ts
import { DataSource, Repository } from 'typeorm';
import { injectable } from 'tsyringe';
import { randomBytes } from 'crypto';

import {
  ProductKey,
  ProductKeyType,
} from '@auth/domain/entities/product-key.entity';
import { ProductKeyRepositoryPort } from '@auth/application/ports/product-key-repository.port';
import { AppDataSource } from '@infra/orm/data-source';

@injectable()
export class TypeOrmProductKeyRepository implements ProductKeyRepositoryPort {
  private readonly repo: Repository<ProductKey> = (
    AppDataSource as DataSource
  ).getRepository(ProductKey);

  async generate(
    opts: {
      type?: ProductKeyType;
      accountId?: number | null;
      maxUses?: number;
      expiresAt?: Date | null;
    } = {},
  ): Promise<ProductKey> {
    const {
      type = 'account', // 👈 por defecto: clave de cuenta
      accountId = null,
      maxUses = type === 'user' ? 5 : 1, // heurística; luego la afinamos
      expiresAt = null,
    } = opts;

    const key = this.repo.create({
      code: randomBytes(24).toString('hex'),
      type,
      accountId,
      maxUses,
      usedCount: 0,
      used: false,
      expiresAt,
    });

    return this.repo.save(key);
  }

  findByCode(code: string): Promise<ProductKey | null> {
    return this.repo.findOne({ where: { code } });
  }

  async markAsUsed(id: number): Promise<void> {
    const key = await this.repo.findOne({ where: { id } });
    if (!key) return;

    key.usedCount = Math.min(key.maxUses, key.usedCount + 1);
    if (key.usedCount >= key.maxUses) {
      key.used = true;
    }

    await this.repo.save(key);
  }

  async save(key: ProductKey): Promise<ProductKey> {
    return this.repo.save(key);
  }

  findAll(): Promise<ProductKey[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findByAccountId(accountId: number): Promise<ProductKey[]> {
    return this.repo.find({
      where: { accountId },
      order: { createdAt: 'ASC' },
    });
  }
}
