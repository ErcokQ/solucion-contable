// src/modules/auth/application/ports/product-key-repository.port.ts
import { ProductKey } from '../../domain/entities/product-key.entity';

export interface ProductKeyRepositoryPort {
  generate(): Promise<ProductKey>;
  findByCode(code: string): Promise<ProductKey | null>;
  markAsUsed(id: number): Promise<void>;
}
