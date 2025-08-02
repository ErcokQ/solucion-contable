import { injectable, inject } from 'tsyringe';
import { PaymentRepositoryPort } from '../ports/payment-repository.port';

@injectable()
export class GetPaymentDetailUseCase {
  constructor(@inject('PaymentRepo') private repo: PaymentRepositoryPort) {}
  execute(id: number) {
    return this.repo.findById(id);
  }
}
