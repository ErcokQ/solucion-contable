import { BullCfdiMonitorService } from '@cfdi/infrastructure/services/bull-cfdi-monitor.service';

export class ListCfdiJobsUseCase {
  async execute(limit = 20) {
    return BullCfdiMonitorService.listAllJobs(limit);
  }
}
