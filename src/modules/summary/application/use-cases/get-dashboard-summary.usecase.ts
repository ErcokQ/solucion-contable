// src/modules/summary/application/use-cases/get-dashboard-summary.usecase.ts
import { inject, injectable } from 'tsyringe';

import { SummaryRepositoryPort } from '../ports/summary-repository.port';
import { SummaryQueryDto } from '../dto/summary-query.dto';

export interface DashboardSummary {
  kpis: {
    cfdiToday: number;
    cfdiMonth: number;
    montoToday: number;
    montoMonth: number;
    cfdiPending: number;

    pagosToday: number;
    montoPagos: number;

    payrollMonth: number;
    percepciones: number;
    deducciones: number;
  };
  series: {
    cfdiLast15: { date: string; count: number }[];
    pagosLast15: { date: string; count: number }[];
  };
  pendientes: import('@summary/application/ports/summary-repository.port').PendingRow[];
}

/**
 * Orquesta todas las llamadas al repositorio de Summary y arma la respuesta
 * que consumirá el dashboard del frontend.
 */
@injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    @inject('SummaryRepo') private readonly repo: SummaryRepositoryPort,
  ) {}

  async execute(dto: SummaryQueryDto): Promise<DashboardSummary> {
    // si no envían rango, usamos el mes en curso
    const now = new Date();
    const desde =
      dto.fechaDesde ?? new Date(now.getFullYear(), now.getMonth(), 1);
    const hasta = dto.fechaHasta ?? now;

    // ejecutar agregados en paralelo
    const [cfdi, pagos, payroll, cfdiSeries, pendientes] = await Promise.all([
      this.repo.getCfdiKpis(desde, hasta),
      this.repo.getPaymentsKpis(desde, hasta),
      this.repo.getPayrollKpis(desde, hasta),
      this.repo.getCfdiSeriesLast15(),
      this.repo.getPendings(),
    ]);

    return {
      kpis: {
        cfdiToday: cfdi.today,
        cfdiMonth: cfdi.month,
        montoToday: cfdi.montoToday,
        montoMonth: cfdi.montoMonth,
        cfdiPending: cfdi.pending,

        pagosToday: pagos.today,
        montoPagos: pagos.monto,

        payrollMonth: payroll.month,
        percepciones: payroll.percepciones,
        deducciones: payroll.deducciones,
      },
      series: {
        cfdiLast15: cfdiSeries,
        pagosLast15: pagos.last15,
      },
      pendientes,
    };
  }
}
