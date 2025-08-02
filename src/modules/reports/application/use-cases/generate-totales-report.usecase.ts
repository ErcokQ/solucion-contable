// src/modules/reports/application/use-cases/generate-totales-report.usecase.ts
import { inject, injectable } from 'tsyringe';
import { ReportTotalesPorRfcDto } from '../dto/report-totales-rfc.dto';
import {
  TotalesPorRfcRow,
  ReportsRepositoryPort,
} from '../ports/cfdi-report.port';
import { ApiError } from '@shared/error/ApiError';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

@injectable()
export class GenerateTotalesPorRfcUseCase {
  constructor(
    @inject('ReportsRepo') private readonly repo: ReportsRepositoryPort,
  ) {}

  async execute(
    dto: ReportTotalesPorRfcDto,
  ): Promise<TotalesPorRfcRow[] | Buffer> {
    const rows = await this.repo.getTotalesPorRfc(dto);

    /* -------- JSON plano -------- */
    if (dto.formato === 'json') return rows;

    /* -------- XLSX -------- */
    if (!rows.length) {
      throw new ApiError(
        404,
        'SIN_DATOS',
        'No hay datos para el rango/criterios enviados',
      );
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Totales');

    ws.columns = [
      { header: 'RFC Contraparte', key: 'rfcContraparte' },
      { header: 'Subtotal', key: 'subtotal' },
      { header: 'Descuento', key: 'descuento' },
      { header: 'Total', key: 'total' },
      { header: 'IVA', key: 'iva' },
      { header: 'Cantidad CFDI', key: 'cantidad' },
    ];

    ws.addRows(rows);
    return Buffer.from(await wb.xlsx.writeBuffer());
  }
}
