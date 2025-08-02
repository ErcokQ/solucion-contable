// src/modules/payroll/application/use-cases/list-payroll.usecase.ts
import { inject, injectable } from 'tsyringe';
import { PayrollRepositoryPort } from '../ports/payroll-repository.port';
import { PayrollQueryDto } from '../dto/payments-query.dto';

@injectable()
export class ListPayrollUseCase {
  constructor(
    @inject('PayrollRepo') private readonly repo: PayrollRepositoryPort,
  ) {}

  execute(dto: PayrollQueryDto) {
    return this.repo.list(dto);
  }
}
