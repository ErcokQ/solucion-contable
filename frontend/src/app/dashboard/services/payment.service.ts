// src/app/services/payments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

/* ----------------------------------------------------------
 * Modelos básicos
 * --------------------------------------------------------*/
export interface PaymentRow {
  id: number;
  fechaPago: string; // ISO yyyy‑mm‑dd
  rfcReceptor: string;
  rfcEmisor: string;
  cfdiUuid: string;
  monto: number;
  moneda: string;
  formaPago: string;
}

export interface PaymentDetail {
  id: number;
  fechaPago: string;
  monto: number;
  moneda: string;
  formaPago: string;
  tipoCambio: string | null;
  cfdiHeader: {
    id: number;
    uuid: string;
    rfcEmisor: string;
    rfcReceptor: string;
    total: string;
  };
  detalles: {
    uuidRelacionado: string;
    importePagado: number;
    saldoAnterior: number;
    saldoInsoluto: number;
  }[];
}

interface PaymentApiResponse {
  data: any[]; // backend raw
  pagination: { total: number; page: number; limit: number };
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private api = `${environment.apiBaseUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Listado paginado de pagos
   */
  listPayments(filters: {
    rfcReceptor?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  }): Observable<{
    data: PaymentRow[];
    pagination: { total: number; page: number; limit: number };
  }> {
    let params = new HttpParams();
    if (filters.rfcReceptor)
      params = params.set('rfcReceptor', filters.rfcReceptor);
    if (filters.fechaDesde)
      params = params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta)
      params = params.set('fechaHasta', filters.fechaHasta);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<PaymentApiResponse>(this.api, { params }).pipe(
      map((res) => ({
        data: res.data.map(
          (p) =>
            <PaymentRow>{
              id: p.id,
              fechaPago: p.fechaPago,
              rfcReceptor: p.cfdiHeader?.rfcReceptor ?? '',
              rfcEmisor: p.cfdiHeader?.rfcEmisor ?? '',
              cfdiUuid: p.cfdiHeader?.uuid ?? '',
              monto: +p.monto,
              moneda: p.moneda,
              formaPago: p.formaPago,
            },
        ),
        pagination: res.pagination,
      })),
    );
  }

  /** Detalle de un pago específico */
  getPaymentDetail(id: number): Observable<PaymentDetail> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      map(
        (d) =>
          <PaymentDetail>{
            id: d.id,
            fechaPago: d.fechaPago,
            monto: +d.monto,
            moneda: d.moneda,
            formaPago: d.formaPago,
            tipoCambio: d.tipoCambio,
            cfdiHeader: {
              id: d.cfdiHeader.id,
              uuid: d.cfdiHeader.uuid,
              rfcEmisor: d.cfdiHeader.rfcEmisor,
              rfcReceptor: d.cfdiHeader.rfcReceptor,
              total: d.cfdiHeader.total,
            },
            detalles: (d.detalles ?? []).map((x: any) => ({
              uuidRelacionado: x.uuidRelacionado,
              importePagado: +x.importePagado,
              saldoAnterior: +x.saldoAnterior,
              saldoInsoluto: +x.saldoInsoluto,
            })),
          },
      ),
    );
  }

  /** Eliminar pago (opcional) */
  deletePayment(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
