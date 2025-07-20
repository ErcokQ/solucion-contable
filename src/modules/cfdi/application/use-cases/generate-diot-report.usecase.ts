import { inject, injectable } from 'tsyringe';
import { CfdiRepositoryPort } from '../ports/cfdi-repository.port';
import { ReportDiotDto } from '../dto/report-diot.dto';

@injectable()
export class GenerateDiotReportUseCase {
  constructor(@inject('CfdiRepo') private readonly repo: CfdiRepositoryPort) {}

  execute(dto: ReportDiotDto) {
    return this.repo.getDiotReport(dto);
  }
}
