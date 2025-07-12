import { inject, injectable } from 'tsyringe';
import { CfdiRepositoryPort } from '../ports/cfdi-repository.port';

@injectable()
export class DeleteCfdiUseCase {
  constructor(@inject('CfdiRepo') private readonly repo: CfdiRepositoryPort) {}

  async execute(uuid: string): Promise<{ uuid: string }> {
    await this.repo.deleteByUuid(uuid);
    return { uuid };
  }
}
