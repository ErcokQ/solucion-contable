// modules/cfdi/application/use-cases/get-cfdi-detail.usecase.ts
import { inject, injectable } from 'tsyringe';
import { CfdiRepositoryPort } from '../ports/cfdi-repository.port';

@injectable()
export class GetCfdiDetailUseCase {
  constructor(@inject('CfdiRepo') private readonly repo: CfdiRepositoryPort) {}

  execute(uuid: string) {
    return this.repo.findByUuidWithDetails(uuid); // ya retorna CfdiRow
  }
}
