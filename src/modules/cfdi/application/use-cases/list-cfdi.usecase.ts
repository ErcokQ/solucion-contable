import { inject, injectable } from 'tsyringe';
import { CfdiRepositoryPort } from '../ports/cfdi-repository.port';
import { CfdiQueryDto } from '../dto/cfdi-query.dto';

@injectable()
export class ListCfdiUseCase {
  constructor(
    @inject('CfdiRepo')
    private readonly repo: CfdiRepositoryPort,
  ) {}

  execute(dto: CfdiQueryDto) {
    return this.repo.findFiltered(dto);
  }
}
