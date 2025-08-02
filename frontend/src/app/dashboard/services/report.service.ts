import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/* ─────────── Tipos de filas de los reportes ─────────── */
export interface CfdiReportRow {
  UUID: string;
  Fecha: string;
  RFC_Emisor: string;
  RFC_Receptor: string;
  Total: string;
  Estatus: string;
}

export interface IvaReportRow {
  UUID: string;
  Fecha: string;
  Mes: string;
  Ano: string;
  RFC_Emisor: string;
  Nombre_Emisor: string;
  RFC_Receptor: string;
  Base: string;
  Tasa: string;
  IVA: string;
  TipoFactor: string;
  Tipo: 'trasladado' | 'acreditable';
  Concepto: string;
}

export interface TotalesRfcRow {
  rfcContraparte: string;
  subtotal: string;
  descuento: string;
  total: string;
  iva: string;
  cantidad: string;
}

export interface PayrollReportRow {
  UUID: string;
  FechaPago: string;
  RFC_Receptor: string;
  DiasPagados: string;
  Percepciones: string;
  Deducciones: string;
  ISR: string;
  Subsidio: string;
  Neto: string;
}

/* ─────────── Alias cortos ─────────── */
type TipoCfdi = 'emitidos' | 'recibidos' | 'cancelados';
type TipoIva = 'emitidos' | 'recibidos';

/* Filtros base que comparten varios reportes */
interface BaseFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: TipoCfdi | TipoIva;
  rfc?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = `${environment.apiBaseUrl}/reports`;

  constructor(private http: HttpClient) {}

  /* ───────────────────────────────────────────────
   * Helper → crea HttpParams ignorando valores vacíos
   * ─────────────────────────────────────────────── */
  /* ───────────────────────────────────────────────
   * Helper → crea HttpParams ignorando valores vacíos
   *  ‣ Descarta: undefined, null, '', y booleanos false
   * ─────────────────────────────────────────────── */
  private toParams(obj: Record<string, unknown>): HttpParams {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(obj)) {
      if (
        v === undefined ||
        v === null ||
        v === '' ||
        (typeof v === 'boolean' && v === false)
      ) {
        continue; // se descarta
      }
      p = p.set(k, String(v));
    }
    return p;
  }

  /* ───────────── Reporte CFDI (tabla + XLSX) ───────────── */
  getCfdiReportJSON(filters: BaseFilters): Observable<CfdiReportRow[]> {
    const params = this.toParams({ ...filters, formato: 'json' });
    return this.http.get<CfdiReportRow[]>(`${this.api}/cfdi`, { params });
  }

  downloadCfdiReportXlsx(filters: BaseFilters) {
    const params = this.toParams({ ...filters, formato: 'xlsx' });
    return this.http.get(`${this.api}/cfdi`, {
      params,
      responseType: 'blob',
    });
  }

  /* ───────────── Reporte IVA ───────────── */
  getIvaReportJSON(dto: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipo: TipoIva;
    rfc: string;
  }): Observable<IvaReportRow[]> {
    const params = this.toParams({ ...dto, formato: 'json' });
    return this.http.get<IvaReportRow[]>(`${this.api}/iva`, { params });
  }

  downloadIvaReportXlsx(dto: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipo: TipoIva;
    rfc: string;
  }) {
    const params = this.toParams({ ...dto, formato: 'xlsx' });
    return this.http.get(`${this.api}/iva`, {
      params,
      responseType: 'blob',
    });
  }

  /* ───────────── Totales por RFC ───────────── */
  getTotalesRfcJSON(dto: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipo: 'emitidos' | 'recibidos';
    rfc: string;
    origen?: 'todos' | 'nomina' | 'factura';
    agruparGlobal?: boolean;
  }): Observable<TotalesRfcRow[]> {
    const params = this.toParams({ ...dto, formato: 'json' });
    return this.http.get<TotalesRfcRow[]>(`${this.api}/totales-rfc`, {
      params,
    });
  }

  downloadTotalesRfcXlsx(dto: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipo: 'emitidos' | 'recibidos';
    rfc: string;
    origen?: 'todos' | 'nomina' | 'factura';
    agruparGlobal?: boolean;
  }) {
    const params = this.toParams({ ...dto, formato: 'xlsx' });
    return this.http.get(`${this.api}/totales-rfc`, {
      params,
      responseType: 'blob',
    });
  }

  /* ─────────────────────────  NÓMINA  ───────────────────────── */

  getPayrollReportJSON(dto: {
    rfc: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<PayrollReportRow[]> {
    const params = this.toParams({ ...dto, formato: 'json' });
    return this.http.get<PayrollReportRow[]>(`${this.api}/nomina`, { params });
  }

  downloadPayrollReportXlsx(dto: {
    rfc: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<Blob> {
    const params = this.toParams({ ...dto, formato: 'xlsx' });
    return this.http.get(`${this.api}/nomina`, {
      params,
      responseType: 'blob',
    });
  }
}
