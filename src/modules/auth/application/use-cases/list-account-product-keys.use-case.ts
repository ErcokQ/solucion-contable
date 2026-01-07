import { injectable, inject } from 'tsyringe';

import { ProductKeyRepositoryPort } from '@auth/application/ports/product-key-repository.port';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';

export interface AccountProductKeySummary {
  id: number;
  code: string;
  type: string;
  createdAt: Date;
  used: boolean;
  usedCount: number;
  maxUses: number;

  createdBy: {
    id: number;
    fullName: string;
    email: string;
  } | null;
}

@injectable()
export class ListAccountProductKeysUseCase {
  constructor(
    @inject('ProductKeyRepo')
    private readonly productKeys: ProductKeyRepositoryPort,

    @inject('UserRepo')
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(accountId: number): Promise<AccountProductKeySummary[]> {
    // ya tienes este método y lo usas en ListAccountsAdminUseCase
    const keys = await this.productKeys.findByAccountId(accountId);

    const summaries: AccountProductKeySummary[] = [];

    for (const k of keys) {
      let createdBy: AccountProductKeySummary['createdBy'] = null;

      if (k.createdByUserId) {
        const u = await this.users.findById(k.createdByUserId);
        if (u) {
          createdBy = {
            id: u.id,
            fullName: u.fullName,
            email: u.email,
          };
        }
      }

      summaries.push({
        id: k.id,
        code: k.code,
        type: k.type,
        createdAt: k.createdAt,
        used: k.used,
        usedCount: k.usedCount,
        maxUses: k.maxUses,
        createdBy,
      });
    }

    return summaries;
  }
}
