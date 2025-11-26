// src/modules/reports/application/ports/reports-repository.port.ts

import { ReportTotalesPorRfcDto } from '../dto/report-totales-rfc.dto';

export interface FacturaPueRaizRow {
  uuidFactura: string;
  fechaFactura: Date;
  rfcEmisorFactura: string;
  rfcReceptorFactura: string;
  rfcContraparte: string; // eje RFC como pidió tu jefe
  metodoPago: string | null;
  formaPago: string | null;
  totalFactura: string;
  numeroPagos: string; // COUNT(...)
  totalPagado: string; // SUM(importePagado)
  saldoCalculado: string; // totalFactura - totalPagado
  primerPagoId: string; // MySQL devuelve string en raw
  uuidPrimerPago: string;
}

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

export interface PagosPueRow {
  uuidPago: string;
  fechaPago: Date;
  rfcEmisorPago: string;
  rfcReceptorPago: string;

  uuidRelacionado: string;
  fechaRelacionado: Date;
  rfcEmisorRelacionado: string;
  rfcReceptorRelacionado: string;

  metodoPagoRelacionado: string | null;
  formaPagoRelacionado: string | null;
  totalRelacionado: number;
  importePagado: number;
  saldoAnterior: number;
  saldoInsoluto: number;
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

  getPagosPueInconsistencias(dto: {
    tipo: 'emitidos' | 'recibidos';
    rfc: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<PagosPueRow[]>;

  getFacturasPueRaiz(params: {
    tipo: 'emitidos' | 'recibidos';
    rfc: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): Promise<FacturaPueRaizRow[]>;
}
