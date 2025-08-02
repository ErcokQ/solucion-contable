// src/modules/reports/application/use-cases/generate-cfdi-report.usecase.ts
import { inject, injectable } from 'tsyringe';
import { ReportsRepositoryPort } from '../ports/cfdi-report.port';
import { CfdiReportDto } from '../dto/cfdi-report.dto';
import { CfdiReportRow } from '../ports/cfdi-report.port';
import { ApiError } from '@shared/error/ApiError';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

@injectable()
export class GenerateCfdiReportUseCase {
  constructor(
    @inject('ReportsRepo') private readonly repo: ReportsRepositoryPort,
  ) {}

  async execute(dto: CfdiReportDto): Promise<CfdiReportRow[] | Buffer> {
    const rows = await this.repo.getCfdiReport(dto);

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
    const ws = wb.addWorksheet('CFDI');
    ws.columns = Object.keys(rows[0]).map((key) => ({ header: key, key }));
    ws.addRows(rows);
    const buf = Buffer.from(await wb.xlsx.writeBuffer());

    return buf;
  }
}
