// src/modules/auth/application/ports/user-account-repository.port.ts
import { UserAccount } from '@account/domain/entities/user-account.entity';

export interface UserAccountRepositoryPort {
  findByUserId(userId: number): Promise<
    Array<{
      accountId: number;
      accountName: string;
    }>
  >;

  /**
   * Crea la relación usuario-cuenta con un rol determinado.
   */
  createLink(params: {
    userId: number;
    accountId: number;
    roleId: number;
    isOwner: boolean;
  }): Promise<void>;
  /**
   * Busca los usuarios dueños de un Account.
   * @param accountId
   */
  findOwnersByAccountId(accountId: number): Promise<UserAccount[]>;

  /**
   * Cuenta cuántos usuarios están vinculados a una cuenta.
   * @param accountId
   */
  countByAccountId(accountId: number): Promise<number>;
}
