// src/modules/reports/application/use-cases/generate-iva-report.usecase.ts
import { inject, injectable } from 'tsyringe';
import { ReportsRepositoryPort, IvaReportRow } from '../ports/iva-report.port';
import { IvaReportDto } from '../dto/iva-report.dto';
import { ApiError } from '@shared/error/ApiError';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

@injectable()
export class GenerateIvaReportUseCase {
  constructor(
    @inject('ReportsRepo') private readonly repo: ReportsRepositoryPort,
  ) {}

  async execute(dto: IvaReportDto): Promise<IvaReportRow[] | Buffer> {
    const rows = await this.repo.getIvaReport(dto);

    if (dto.formato === 'json') return rows;

    if (!rows.length) {
      throw new ApiError(
        404,
        'SIN_DATOS',
        'No hay datos para el rango/criterios enviados',
      );
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('IVA');

    ws.columns = [
      { header: 'UUID', key: 'UUID' },
      { header: 'Fecha', key: 'Fecha' },
      { header: 'Mes', key: 'Mes' },
      { header: 'Año', key: 'Año' },
      { header: 'RFC_Emisor', key: 'RFC_Emisor' },
      { header: 'Nombre_Emisor', key: 'Nombre_Emisor' },
      { header: 'RFC_Receptor', key: 'RFC_Receptor' },
      { header: 'Base', key: 'Base' },
      { header: 'Tasa', key: 'Tasa' },
      { header: 'IVA', key: 'IVA' },
      { header: 'TipoFactor', key: 'TipoFactor' },
      { header: 'Tipo', key: 'Tipo' },
      { header: 'Concepto', key: 'Concepto' },
    ];

    const rowsFormatted = rows.map((r) => ({
      ...r,
      Fecha: new Date(r.Fecha).toISOString().split('T')[0], // yyyy-mm-dd
      Tasa: `${Number(r.Tasa) * 100}%`,
    }));

    ws.addRows(rowsFormatted);

    return Buffer.from(await wb.xlsx.writeBuffer());
  }
}
