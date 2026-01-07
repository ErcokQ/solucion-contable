// src/modules/account/application/use-cases/toggle-account-active.use-case.ts
import { injectable, inject } from 'tsyringe';
import { AccountRepositoryPort } from '@account/application/ports/account-repository.port';
import { ToggleAccountActiveDto } from '../dto/toggle-account-active.dto';
import { ApiError } from '@shared/error/ApiError';

@injectable()
export class ToggleAccountActiveUseCase {
  constructor(
    @inject('AccountRepo')
    private readonly accounts: AccountRepositoryPort,
  ) {}

  async execute(dto: ToggleAccountActiveDto) {
    const acc = await this.accounts.findById(dto.accountId);
    if (!acc) throw new ApiError(404, 'ACCOUNT_NOT_FOUND');

    acc.active = dto.active;
    await this.accounts.save(acc);

    return {
      id: acc.id,
      active: acc.active,
    };
  }
}
