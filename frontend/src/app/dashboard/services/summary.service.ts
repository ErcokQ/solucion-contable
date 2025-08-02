// -------- src/app/services/summary.service.ts --------
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  kpis: {
    cfdiToday: number;
    cfdiMonth: number;
    montoToday: number;
    montoMonth: number;
    cfdiPending: number;
    pagosToday: number;
    montoPagos: number;
    payrollMonth: number;
    percepciones: number | null;
    deducciones: number | null;
  };
  series: {
    cfdiLast15: { date: string; count: number }[];
    pagosLast15: { date: string; count: number }[];
  };
  pendientes: {
    tipo: 'CFDI' | 'PAGO' | 'NÓMINA';
    ref: string | number;
    fecha: string;
    msg: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private api = `${environment.apiBaseUrl}/dashboard/summary`;

  constructor(private http: HttpClient) {}

  /** Obtiene el resumen opcionalmente con rango */
  getSummary(params?: {
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<DashboardSummary> {
    let httpParams = new HttpParams();
    if (params?.fechaDesde)
      httpParams = httpParams.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta)
      httpParams = httpParams.set('fechaHasta', params.fechaHasta);

    return this.http.get<DashboardSummary>(this.api, { params: httpParams });
  }
}
