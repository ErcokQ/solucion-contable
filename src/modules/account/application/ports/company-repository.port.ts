// src/modules/account/application/ports/company-repository.port.ts
import { Company } from '@account/domain/entities/company.entity';

/**
 * Interfaz del repositorio de compañías (empresas fiscales)
 * asociadas a un Account.
 */
export interface CompanyRepositoryPort {
  /**
   * Busca una compañía por su id.
   * @param id ID de la compañía
   * @returns Company o null si no existe
   */
  findById(id: number): Promise<Company | null>;

  /**
   * Guarda una compañía nueva o actualizada en el repositorio.
   * @param company Entidad Company a persistir
   */
  save(company: Company): Promise<void>;
  /**
   * Busca todas las compañías asociadas a un Account.
   * @param accountId
   */
  findByAccountId(accountId: number): Promise<Company[]>;
}
