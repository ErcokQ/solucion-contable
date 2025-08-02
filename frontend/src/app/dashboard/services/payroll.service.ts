// ------------------------------
// src/app/services/payroll.service.ts
// ------------------------------
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

/* ------------- modelos ------------- */
export interface PayrollRow {
  id: number;
  tipoNomina: 'O' | 'E';
  fechaPago: string;
  rfcReceptor: string;
  rfcEmisor: string;
  cfdiUuid: string;
  totalPercepciones: number;
  totalDeducciones: number;
}

export interface PayrollDetail extends PayrollRow {
  fechaInicialPago: string;
  fechaFinalPago: string;
  diasPagados: number;
  totalOtrosPagos: number;
  percepciones: {
    id: number;
    clave: string;
    concepto: string;
    importeGravado: number;
    importeExento: number;
  }[];
  deducciones: {
    id: number;
    clave: string;
    concepto: string;
    importe: number;
  }[];
  otrosPagos: {
    id: number;
    clave: string;
    concepto: string;
    importe: number;
  }[];
}

interface PayrollApiResponse {
  data: any[];
  pagination: { total: number; page: number; limit: number };
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private api = `${environment.apiBaseUrl}/payrolls`;
  constructor(private http: HttpClient) {}

  listPayrolls(filters: {
    rfcReceptor?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    tipoNomina?: 'O' | 'E';
    page?: number;
    limit?: number;
  }): Observable<{
    data: PayrollRow[];
    pagination: { total: number; page: number; limit: number };
  }> {
    let params = new HttpParams();
    if (filters.rfcReceptor)
      params = params.set('rfcReceptor', filters.rfcReceptor);
    if (filters.fechaDesde)
      params = params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta)
      params = params.set('fechaHasta', filters.fechaHasta);
    if (filters.tipoNomina)
      params = params.set('tipoNomina', filters.tipoNomina);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<PayrollApiResponse>(this.api, { params }).pipe(
      map((res) => ({
        data: res.data.map(
          (p) =>
            <PayrollRow>{
              id: p.id,
              tipoNomina: p.tipoNomina,
              fechaPago: p.fechaPago,
              rfcReceptor: p.cfdiHeader?.rfcReceptor ?? '',
              rfcEmisor: p.cfdiHeader?.rfcEmisor ?? '',
              cfdiUuid: p.cfdiHeader?.uuid ?? '',
              totalPercepciones: +p.totalPercepciones,
              totalDeducciones: +p.totalDeducciones,
            },
        ),
        pagination: res.pagination,
      })),
    );
  }

  getPayrollDetail(id: number): Observable<PayrollDetail> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      map(
        (d) =>
          <PayrollDetail>{
            id: d.id,
            tipoNomina: d.tipoNomina,
            fechaPago: d.fechaPago,
            fechaInicialPago: d.fechaInicialPago,
            fechaFinalPago: d.fechaFinalPago,
            diasPagados: d.diasPagados,
            rfcReceptor: d.cfdiHeader.rfcReceptor,
            rfcEmisor: d.cfdiHeader.rfcEmisor,
            cfdiUuid: d.cfdiHeader.uuid,
            totalPercepciones: +d.totalPercepciones,
            totalDeducciones: +d.totalDeducciones,
            totalOtrosPagos: +d.totalOtrosPagos,
            percepciones: d.percepciones.map((x: any) => ({
              ...x,
              importeGravado: +x.importeGravado,
              importeExento: +x.importeExento,
            })),
            deducciones: d.deducciones.map((x: any) => ({
              ...x,
              importe: +x.importe,
            })),
            otrosPagos: d.otrosPagos.map((x: any) => ({
              ...x,
              importe: +x.importe,
            })),
          },
      ),
    );
  }
}
