// src/modules/payroll/application/use-cases/get-payroll-detail.usecase.ts
import { inject, injectable } from 'tsyringe';
import { PayrollRepositoryPort } from '../ports/payroll-repository.port';
import { ApiError } from '@shared/error/ApiError';

@injectable()
export class GetPayrollDetailUseCase {
  constructor(
    @inject('PayrollRepo') private readonly repo: PayrollRepositoryPort,
  ) {}

  async execute(id: number) {
    const payroll = await this.repo.findById(id);
    if (!payroll) throw new ApiError(404, 'PAYROLL_NOT_FOUND');
    return payroll;
  }
}
