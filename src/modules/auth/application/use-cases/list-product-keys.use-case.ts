// src/modules/auth/application/use-cases/list-product-keys.use-case.ts
import { injectable, inject } from 'tsyringe';
import { ProductKeyRepositoryPort } from '@auth/application/ports/product-key-repository.port';

@injectable()
export class ListProductKeysUseCase {
  constructor(
    @inject('ProductKeyRepo')
    private readonly productKeys: ProductKeyRepositoryPort,
  ) {}

  async execute() {
    const keys = await this.productKeys.findAll();

    // DTO simplificado para el front
    return keys.map((k) => ({
      id: k.id,
      code: k.code,
      used: k.used,
      maxUses: k.maxUses,
      usedCount: k.usedCount,
      type: k.type,
      accountId: k.accountId,
      createdByUserId: k.createdByUserId,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    }));
  }
}
