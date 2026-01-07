// src/modules/account/application/use-cases/get-my-account.use-case.ts
import { inject, injectable } from 'tsyringe';
import { ApiError } from '@shared/error/ApiError';
import { AccountRepositoryPort } from '@account/application/ports/account-repository.port';
import {
  AccountMeDtoSchema,
  type AccountMeDto,
} from '@account/application/dto/account-me.dto';

@injectable()
export class GetMyAccountUseCase {
  constructor(
    @inject('AccountRepo')
    private accounts: AccountRepositoryPort,
  ) {}

  async execute(input: { accountId: number }): Promise<AccountMeDto> {
    const acc = await this.accounts.findById(input.accountId);

    if (!acc) throw new ApiError(404, 'ACCOUNT_NOT_FOUND');
    if (!acc.active) throw new ApiError(403, 'ACCOUNT_INACTIVE');

    const dto = {
      id: acc.id,
      name: acc.name,
      plan: acc.plan,
      maxUsers: acc.maxUsers,
      maxCompanies: acc.maxCompanies,
      active: acc.active,
    };

    // ✅ “source of truth” en runtime (evita devolver basura si algo cambia)
    return AccountMeDtoSchema.parse(dto);
  }
}
