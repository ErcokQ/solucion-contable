// src/modules/summary/application/ports/summary-repository.port.ts
import { CfdiHeader } from '@cfdi/domain/entities/cfdi.entity';
import { PaymentHeader } from '@payments/domain/entities/payment-header.entity';
import { PayrollHeader } from '@payroll/domain/entities/payroll-header.entity';

/**
 * Registro pendiente genérico: puede provenir de CFDI, Pago o Nómina.
 * Ajusta los campos según la definición exacta que quieras exponer.
 */
export type PendingRow =
  | { tipo: 'CFDI'; ref: string; fecha: Date; msg: string; entity: CfdiHeader }
  | {
      tipo: 'PAGO';
      ref: number;
      fecha: Date;
      msg: string;
      entity: PaymentHeader;
    }
  | {
      tipo: 'NOMINA';
      ref: number;
      fecha: Date;
      msg: string;
      entity: PayrollHeader;
    };

/**
 * Métodos que el repositorio de Summary debe implementar.
 * Todos los cálculos (COUNT, SUM, series) se agrupan aquí para que el
 * use-case solo orqueste.
 */
export interface SummaryRepositoryPort {
  /** KPI de CFDI (hoy, mes, montos, pendientes) */
  getCfdiKpis(
    d: Date,
    h: Date,
  ): Promise<{
    today: number;
    month: number;
    montoToday: number;
    montoMonth: number;
    pending: number;
  }>;

  /** KPI de pagos (hoy, total monto, serie últimos 15 días) */
  getPaymentsKpis(
    d: Date,
    h: Date,
  ): Promise<{
    today: number;
    monto: number;
    last15: { date: string; count: number }[];
  }>;

  /** KPI de nómina (mes, totales percepciones/deducciones) */
  getPayrollKpis(
    d: Date,
    h: Date,
  ): Promise<{
    month: number;
    percepciones: number;
    deducciones: number;
  }>;

  /** Serie CFDI últimos 15 días */
  getCfdiSeriesLast15(): Promise<{ date: string; count: number }[]>;

  /** Pendientes / errores recientes para la tabla resumen */
  getPendings(): Promise<PendingRow[]>;
}
