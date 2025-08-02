import { inject, injectable } from 'tsyringe';
import { CfdiRepositoryPort } from '../ports/cfdi-repository.port';

@injectable()
export class GetCfdiXmlUseCase {
  constructor(@inject('CfdiRepo') private readonly repo: CfdiRepositoryPort) {}

  async execute(uuid: string): Promise<string> {
    return this.repo.getXmlPathByUuid(uuid);
  }
}
