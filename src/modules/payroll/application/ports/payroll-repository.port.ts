// src/modules/payroll/application/ports/payroll-repository.port.ts
import { PayrollHeader } from '@payroll/domain/entities/payroll-header.entity';
import { PayrollQueryDto } from '../dto/payments-query.dto';

/** Objeto genérico de paginación */
export interface Paginated<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Puerto que abstrae el acceso a la persistencia de nóminas
 */
export interface PayrollRepositoryPort {
  /** Persiste el encabezado de nómina y devuelve la entidad con id asignado */
  save(header: PayrollHeader): Promise<PayrollHeader>;

  /** Devuelve un listado paginado según los filtros */
  list(query: PayrollQueryDto): Promise<Paginated<PayrollHeader>>;

  /** Obtiene una nómina por id o null si no existe */
  findById(id: number): Promise<PayrollHeader | null>;
}
