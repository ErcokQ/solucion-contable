// modules/payments/application/ports/payment-repository.port.ts
import { PaymentHeader } from '@payments/domain/entities/payment-header.entity';
import { PaymentsQueryDto } from '../dto/payments-query.dto';

export interface PaymentRepositoryPort {
  save(header: PaymentHeader): Promise<PaymentHeader>;
  findById(id: number): Promise<PaymentHeader | null>;
  list(filters: PaymentsQueryDto): Promise<{
    data: PaymentHeader[];
    pagination: { total: number; page: number; limit: number };
  }>;
}
