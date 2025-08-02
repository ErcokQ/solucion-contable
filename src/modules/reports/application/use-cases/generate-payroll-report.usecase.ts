// src/modules/reports/application/use-cases/generate-payroll-report.usecase.ts
import { inject, injectable } from 'tsyringe';
import {
  ReportsRepositoryPort,
  PayrollDetRow,
} from '../ports/cfdi-report.port';
import { ApiError } from '@shared/error/ApiError';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

@injectable()
export class GeneratePayrollReportUseCase {
  constructor(
    @inject('ReportsRepo') private readonly repo: ReportsRepositoryPort,
  ) {}

  async execute(dto: {
    rfc: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    formato: 'json' | 'xlsx';
  }): Promise<PayrollDetRow[] | Buffer> {
    const rows = await this.repo.getPayrollReport(dto);

    if (dto.formato === 'json') return rows;

    if (!rows.length)
      throw new ApiError(
        404,
        'SIN_DATOS',
        'No hay datos para el rango solicitado',
      );

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Nomina');

    ws.columns = [
      { header: 'UUID', key: 'UUID' },
      { header: 'FechaPago', key: 'FechaPago' },
      { header: 'RFC_Receptor', key: 'RFC_Receptor' },
      { header: 'DiasPagados', key: 'DiasPagados' },
      { header: 'Percepciones', key: 'Percepciones' },
      { header: 'Deducciones', key: 'Deducciones' },
      { header: 'ISR', key: 'ISR' },
      { header: 'Subsidio', key: 'Subsidio' },
      { header: 'Neto', key: 'Neto' },
    ];

    ws.addRows(rows);
    return Buffer.from(await wb.xlsx.writeBuffer());
  }
}
