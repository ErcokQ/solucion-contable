// src/modules/account/application/use-cases/list-accounts-admin.use-case.ts
import { injectable, inject } from 'tsyringe';

import { AccountRepositoryPort } from '@account/application/ports/account-repository.port';
import { CompanyRepositoryPort } from '@account/application/ports/company-repository.port';
import { UserAccountRepositoryPort } from '@auth/application/ports/user-account-repository.port';
import { UserRepositoryPort } from '@auth/application/ports/user-repository.port';
import { ProductKeyRepositoryPort } from '@auth/application/ports/product-key-repository.port';

export interface AdminAccountSummary {
  id: number;
  name: string;
  plan: string;
  active: boolean;
  createdAt: Date;

  // NUEVO: stats rápidas
  maxUsers: number;
  maxCompanies: number;
  usersUsed: number;
  companiesUsed: number;
  /** Por ahora null; cuando tengas tracking de logins lo rellenas */
  lastLoginAt: Date | null;

  owner: {
    id: number;
    fullName: string;
    email: string;
  } | null;

  companies: {
    id: number;
    name: string;
    rfc: string;
    active: boolean;
  }[];

  productKey: {
    id: number;
    code: string;
    createdAt: Date;
    createdByUserId: number | null;
  } | null;
}

@injectable()
export class ListAccountsAdminUseCase {
  constructor(
    @inject('AccountRepo')
    private readonly accounts: AccountRepositoryPort,
    @inject('CompanyRepo')
    private readonly companies: CompanyRepositoryPort,
    @inject('UserAccountRepo')
    private readonly userAccounts: UserAccountRepositoryPort,
    @inject('UserRepo')
    private readonly users: UserRepositoryPort,
    @inject('ProductKeyRepo')
    private readonly productKeys: ProductKeyRepositoryPort,
  ) {}

  async execute(): Promise<AdminAccountSummary[]> {
    const accounts = await this.accounts.findAll();

    const summaries: AdminAccountSummary[] = [];

    for (const acc of accounts) {
      // 1) Empresas de la cuenta
      const companies = await this.companies.findByAccountId(acc.id);

      // 2) Owner (primer UserAccount isOwner=true)
      const ownerLinks = await this.userAccounts.findOwnersByAccountId(acc.id);
      let owner: AdminAccountSummary['owner'] = null;

      if (ownerLinks.length > 0) {
        const ownerUa = ownerLinks[0];
        const user = await this.users.findById(ownerUa.userId);
        if (user) {
          owner = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
          };
        }
      }

      // 3) Product key de tipo 'account' asociada a esta cuenta
      const keys = await this.productKeys.findByAccountId(acc.id);
      const pk = keys.find((k) => k.type === 'account') ?? null;

      // 4) Stats rápidas
      // 👉 Necesitas exponer este método en UserAccountRepositoryPort y su implementación:
      //    countByAccountId(accountId: number): Promise<number>
      const usersUsed = await this.userAccounts.countByAccountId(acc.id);
      const companiesUsed = companies.length;

      // TODO: en el futuro, cuando tengas tabla de sesiones/logins,
      // calcula aquí el lastLoginAt real.
      const lastLoginAt: Date | null = null;

      summaries.push({
        id: acc.id,
        name: acc.name,
        plan: acc.plan,
        active: acc.active,
        createdAt: acc.createdAt,

        maxUsers: acc.maxUsers,
        maxCompanies: acc.maxCompanies,
        usersUsed,
        companiesUsed,
        lastLoginAt,

        owner,

        companies: companies.map((c) => ({
          id: c.id,
          name: c.name,
          rfc: c.rfc,
          active: c.active,
        })),

        productKey: pk
          ? {
              id: pk.id,
              code: pk.code,
              createdAt: pk.createdAt,
              createdByUserId: pk.createdByUserId,
            }
          : null,
      });
    }

    return summaries;
  }
}
