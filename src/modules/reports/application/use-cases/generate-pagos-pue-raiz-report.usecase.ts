// src/modules/reports/application/use-cases/generate-pagos-pue-raiz-report.usecase.ts
import { inject, injectable } from 'tsyringe';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

import {
  ReportsRepositoryPort,
  FacturaPueRaizRow,
} from '../ports/cfdi-report.port';
import { PagosPueRaizReportDto } from '../dto/pagos-pue-raiz-report.dto';
import { ApiError } from '@shared/error/ApiError';

type FacturaPueRaizConMotivo = FacturaPueRaizRow & {
  motivo: string;
};

@injectable()
export class GeneratePagosPueRaizReportUseCase {
  constructor(
    @inject('ReportsRepo') private readonly repo: ReportsRepositoryPort,
  ) {}

  async execute(
    dto: PagosPueRaizReportDto,
  ): Promise<FacturaPueRaizConMotivo[] | Buffer> {
    const raw = await this.repo.getFacturasPueRaiz({
      tipo: dto.tipo,
      rfc: dto.rfc,
      fechaDesde: dto.fechaDesde,
      fechaHasta: dto.fechaHasta,
    });

    const rows: FacturaPueRaizConMotivo[] = raw.map((r) => {
      //const total = Number(r.totalFactura ?? 0);
      const pagado = Number(r.totalPagado ?? 0);
      const numPagos = Number(r.numeroPagos ?? 0);
      const saldo = Number(r.saldoCalculado ?? 0);

      let motivo: string;

      if (numPagos <= 0 || pagado === 0) {
        motivo = 'PUE_CON_PAGO_CFDI_INDETERMINADO';
      } else if (saldo > 0 && numPagos > 1) {
        motivo = 'PUE_CON_PARCIALIDADES_Y_SALDO_PENDIENTE';
      } else if (saldo > 0 && numPagos === 1) {
        motivo = 'PUE_CON_PAGO_PARCIAL';
      } else if (saldo <= 0 && numPagos > 1) {
        motivo = 'PUE_CON_PARCIALIDADES_PAGADA_CON_COMPLEMENTOS';
      } else {
        // saldo <= 0 && numPagos === 1
        motivo = 'PUE_PAGADA_CON_COMPLEMENTO_DE_PAGO';
      }

      return { ...r, motivo };
    });

    if (dto.formato === 'json') return rows;

    if (!rows.length) {
      throw new ApiError(
        404,
        'SIN_DATOS',
        'No hay facturas PUE con pagos relacionados para los criterios enviados',
      );
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Facturas-PUE-Raiz');

    ws.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
    }));
    ws.addRows(rows);

    const buf = Buffer.from(await wb.xlsx.writeBuffer());
    return buf;
  }
}
