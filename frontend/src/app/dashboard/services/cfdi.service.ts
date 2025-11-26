// src/app/services/cfdi.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CfdiRow {
  uuid: string;
  fecha: string;
  rfcEmisor: string;
  rfcReceptor: string;
  total: number;
  status: string;
  subTotal: number;
  descuento: number;
  metodoPago?: string;
  uuidSustituto: string | null;
  uuidSustituido: string | null;
  concepts: Array<{
    id: number;
    descripcion: string;
    cantidad: number;
    unidad: string;
    valorUnitario: number;
    importe: number;
    taxes: Array<{
      id: number;
      tipo: string;
      tasaCuota: number;
      importe: number;
      impuesto: string;
      base: number;
    }>;
  }>;
}

interface CfdiApiResponse {
  data: CfdiRow[];
  pagination: { total: number; page: number; limit: number };
}

export interface DiotRow {
  rfcReceptor: string;
  tipo: string;
  impuesto: string;
  base: number;
  importe: number;
}

@Injectable({ providedIn: 'root' })
export class CfdiService {
  private api = `${environment.apiBaseUrl}/cfdi`;

  constructor(private http: HttpClient) {}

  /** Devuelve data + pagination para que el componente maneje las páginas */
  listCfdis(filtros: {
    fechaDesde?: string;
    fechaHasta?: string;
    rfc?: string;
    rfcReceptor?: string;
    page?: number;
    limit?: number;
    status?: string | null;
    totalMin?: number;
    totalMax?: number;
    uuid?: string;
  }): Observable<{
    data: CfdiRow[];
    pagination: { total: number; page: number; limit: number };
  }> {
    let params = new HttpParams();
    if (filtros.fechaDesde)
      params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta)
      params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.rfc) params = params.set('rfcEmisor', filtros.rfc);
    if (filtros.rfcReceptor)
      params = params.set('rfcReceptor', filtros.rfcReceptor);
    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    if (filtros.status) params = params.set('status', filtros.status);
    if (filtros.totalMin)
      params = params.set('totalMin', filtros.totalMin.toString());
    if (filtros.totalMax)
      params = params.set('totalMax', filtros.totalMax.toString());

    return this.http.get<CfdiApiResponse>(this.api, { params }).pipe(
      map((res) => ({
        data: res.data.map((row) => ({ ...row, total: +row.total })),
        pagination: res.pagination,
      })),
    );
  }

  /** Descarga XML protegido con JWT */
  downloadXml(uuid: string) {
    this.http
      .get(`${this.api}/${uuid}/xml`, { responseType: 'blob' })
      .subscribe((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${uuid}.xml`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  getCfdiDetail(uuid: string): Observable<any> {
    return this.http.get(`${this.api}/${uuid}`);
  }

  deleteCfdi(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${uuid}`);
  }

  // ---------------- Reporte DIOT ----------------
  getDiotReport(desde: string, hasta: string) {
    const params = new HttpParams()
      .set('fechaDesde', desde)
      .set('fechaHasta', hasta);

    return this.http.get<
      {
        rfcReceptor: string;
        tipo: string;
        impuesto: string;
        base: number; // el backend ya lo castea a number
        importe: number;
      }[]
    >(`${this.api}/report/diot`, { params });
  }
}
