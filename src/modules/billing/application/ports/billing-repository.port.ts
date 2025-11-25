// modules/billing/application/ports/billing-repository.port.ts
import { BillingInvoice } from '@billing/domain/entities/billing-invoice.entity';
import { BillingQueryDto } from '../dto/billing-query.dto';

export interface BillingRepositoryPort {
  save(inv: BillingInvoice): Promise<BillingInvoice>; // upsert agregados
  findById(id: number): Promise<BillingInvoice | null>;
  findByUuid(uuid: string): Promise<BillingInvoice | null>;
  list(filters: BillingQueryDto): Promise<{
    data: BillingInvoice[];
    pagination: { total: number; page: number; limit: number };
  }>;
  markStamped(
    id: number,
    payload: {
      uuid: string;
      fechaTimbrado: Date;
      xmlPath: string;
      pdfPath?: string | null;
    },
  ): Promise<void>;
  markStatus(
    id: number,
    status: 'READY' | 'FAILED' | 'CANCELLED',
  ): Promise<void>;
}
