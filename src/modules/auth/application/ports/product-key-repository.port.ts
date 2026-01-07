// src/modules/auth/application/ports/product-key-repository.port.ts
import {
  ProductKey,
  ProductKeyType,
} from '@auth/domain/entities/product-key.entity';

export interface ProductKeyRepositoryPort {
  /**
   * Genera y persiste una nueva ProductKey.
   * - Por defecto genera una clave de tipo 'account',
   *   sin accountId asociado, maxUses = 1.
   */
  generate(opts?: {
    type?: ProductKeyType; // 'account' | 'user'
    accountId?: number | null; // para claves de usuario
    maxUses?: number; // para 'user' típicamente >1, 'account' =1
    expiresAt?: Date | null;
    createdByUserId?: number | null;
  }): Promise<ProductKey>;

  /**
   * Busca una clave por su código.
   */
  findByCode(code: string): Promise<ProductKey | null>;

  /**
   * Marca un id de clave como usada, incrementando usedCount
   * y seteando used = true si ya se llegó a maxUses.
   */
  markAsUsed(id: number): Promise<void>;

  /**
   * Guarda cambios en una ProductKey (p.ej. para ligar accountId,
   * ajustar usedCount, etc.)
   */
  save(key: ProductKey): Promise<ProductKey>;

  findAll(): Promise<ProductKey[]>;

  /**
   * Busca todas las claves asociadas a un Account.
   * @param accountId
   */
  findByAccountId(accountId: number): Promise<ProductKey[]>;
}
