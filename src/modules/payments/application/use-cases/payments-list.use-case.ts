import { injectable, inject } from 'tsyringe';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';
import { PaymentsQueryDto } from '../dto/payments-query.dto';

@injectable()
export class ListPaymentsUseCase {
  constructor(@inject('PaymentRepo') private repo: PaymentRepositoryPort) {}
  execute(dto: PaymentsQueryDto) {
    return this.repo.list(dto);
  }
}
