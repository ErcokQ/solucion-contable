// src/modules/auth/application/use-cases/generate-product-key.use-case.ts
import { injectable, inject } from 'tsyringe';
import { ProductKeyRepositoryPort } from '@auth/application/ports/product-key-repository.port';

@injectable()
export class GenerateProductKeyUseCase {
  constructor(
    @inject('ProductKeyRepo')
    private readonly productKeys: ProductKeyRepositoryPort,
  ) {}

  async execute(adminUserId: number) {
    const key = await this.productKeys.generate({
      type: 'account',
      maxUses: 1,
      createdByUserId: adminUserId,
    });

    return {
      id: key.id,
      code: key.code,
      used: key.used,
      maxUses: key.maxUses,
      usedCount: key.usedCount,
      accountId: key.accountId,
      createdByUserId: key.createdByUserId,
      createdAt: key.createdAt,
    };
  }
}
