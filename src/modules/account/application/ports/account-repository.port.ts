// src/modules/account/application/ports/account-repository.port.ts
import { Account } from '@account/domain/entities/account.entity';

/**
 * Interfaz del repositorio de cuentas (tenants).
 * Se usa desde casos de uso como RegisterAccount para
 * persistir nuevos accounts y consultar cuentas existentes.
 */
export interface AccountRepositoryPort {
  /**
   * Busca una cuenta por su id.
   * @param id ID de la cuenta
   * @returns Account o null si no existe
   */
  findById(id: number): Promise<Account | null>;

  /**
   * Guarda una cuenta nueva o actualizada en el repositorio.
   * @param account Entidad Account a persistir
   */
  save(account: Account): Promise<void>;

  findAll(): Promise<Account[]>;
}
