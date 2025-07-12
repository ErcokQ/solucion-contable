// modules/cfdi/application/use-cases/get-cfdi-detail.usecase.ts
import { inject, injectable } from 'tsyringe';
import { CfdiRepositoryPort } from '../ports/cfdi-repository.port';

@injectable()
export class GetCfdiDetailUseCase {
  constructor(@inject('CfdiRepo') private readonly repo: CfdiRepositoryPort) {}

  async execute(uuid: string) {
    const header = await this.repo.findByUuidWithDetails(uuid);
    return header;
  }
}
