import { inject, injectable } from 'tsyringe';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

import { ReportsRepositoryPort, PagosPueRow } from '../ports/cfdi-report.port';
import { PagosPueReportDto } from '../dto/pagos-pue-report.dto';
import { ApiError } from '@shared/error/ApiError';

type PagosPueRowConMotivo = PagosPueRow & {
  motivo: string;
};

@injectable()
export class GeneratePagosPueReportUseCase {
  constructor(
    @inject('ReportsRepo') private readonly repo: ReportsRepositoryPort,
  ) {}

  async execute(
    dto: PagosPueReportDto,
  ): Promise<PagosPueRowConMotivo[] | Buffer> {
    /* 1️⃣ Obtener filas crudas desde el repositorio */
    const rawRows = await this.repo.getPagosPueInconsistencias({
      tipo: dto.tipo,
      rfc: dto.rfc,
      fechaDesde: dto.fechaDesde,
      fechaHasta: dto.fechaHasta,
    });

    /* 2️⃣ Anotar cada fila con el motivo de la inconsistencia */
    const rows: PagosPueRowConMotivo[] = rawRows.map((r) => ({
      ...r,
      motivo: 'PAGO_SOBRE_FACTURA_PUE',
    }));

    /* 3️⃣ Formato JSON: devolver tal cual, aunque esté vacío */
    if (dto.formato === 'json') {
      return rows;
    }

    /* 4️⃣ Formato XLSX: sin filas => error controlado */
    if (!rows.length) {
      throw new ApiError(
        404,
        'SIN_DATOS',
        'No hay inconsistencias de pagos sobre facturas PUE para los criterios enviados',
      );
    }

    /* 5️⃣ Construir workbook de Excel */
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Pagos-PUE');

    // Encabezados basados en las propiedades de la fila
    ws.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
    }));

    ws.addRows(rows);

    const buf = Buffer.from(await wb.xlsx.writeBuffer());
    return buf;
  }
}
