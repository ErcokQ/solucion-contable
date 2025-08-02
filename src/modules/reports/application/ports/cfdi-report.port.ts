// src/modules/reports/application/ports/reports-repository.port.ts

import { ReportTotalesPorRfcDto } from '../dto/report-totales-rfc.dto';

export interface CfdiReportRow {
  UUID: string;
  Fecha: Date;
  RFC_Emisor: string;
  RFC_Receptor: string;
  Total: number;
  Estatus: string;
}

export interface TotalesPorRfcRow {
  rfcContraparte: string;
  subtotal: string;
  descuento: string;
  total: string;
  iva: string;
  cantidad: string;
}

export interface PayrollDetRow {
  UUID: string;
  FechaPago: Date;
  RFC_Receptor: string;
  DiasPagados: number;
  Percepciones: string;
  Deducciones: string;
  ISR: string;
  Subsidio: string;
  Neto: string;
}

export interface ReportsRepositoryPort {
  getCfdiReport(dto: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    tipo: 'emitidos' | 'recibidos' | 'cancelados';
    rfcEmisor?: string;
    rfcReceptor?: string;
  }): Promise<CfdiReportRow[]>;

  getTotalesPorRfc(dto: ReportTotalesPorRfcDto): Promise<TotalesPorRfcRow[]>;

  getPayrollReport(dto: {
    rfc: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<PayrollDetRow[]>;
}
