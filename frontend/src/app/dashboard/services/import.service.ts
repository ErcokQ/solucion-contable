// src/app/dashboard/import.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { Observable, map, filter } from 'rxjs';
import { environment } from '../../../environments/environment';

/* --------- modelos mínimos --------- */
interface BaseBulkResult {
  file: string;
}
export type BulkResult =
  | (BaseBulkResult & { status: 'invalid_xml'; error: string })
  | (BaseBulkResult & { status: 'skipped' })
  | (BaseBulkResult & { status: 'already_imported'; id: number })
  | (BaseBulkResult & { status: 'enqueued'; id: number });

export interface JobDto {
  id: string; // id interno de BullMQ
  name: string; // nombre del job
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number; // 0-100
  createdAt: string; // ISO-date
}

export type ZipEvent =
  | { kind: 'progress'; pct: number }
  | { kind: 'result'; list: BulkResult[] };

/* --------- servicio --------- */
@Injectable({ providedIn: 'root' })
export class ImportService {
  private api = `${environment.apiBaseUrl}/cfdi`;

  constructor(private http: HttpClient) {}

  /** carga un solo XML y emite el porcentaje (0-100) */
  uploadXml(file: File): Observable<number> {
    const fd = new FormData();
    fd.append('xml', file, file.name);

    return this.http
      .post<HttpEvent<unknown>>(`${this.api}`, fd, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((e) =>
          e.type === HttpEventType.UploadProgress
            ? Math.round((100 * e.loaded) / (e.total ?? 1))
            : 100,
        ),
      );
  }

  uploadZip(zip: File): Observable<ZipEvent> {
    const fd = new FormData();
    fd.append('file', zip, zip.name);

    return (
      this.http
        // 👇 solo el tipo del body final
        .post<BulkResult[]>(`${this.api}/uploads`, fd, {
          observe: 'events',
          reportProgress: true,
        })
        .pipe(
          // nos quedamos sólo con Progress y Response
          filter(
            (e): e is HttpEvent<BulkResult[]> =>
              e.type === HttpEventType.UploadProgress ||
              e.type === HttpEventType.Response,
          ),
          map((e): ZipEvent => {
            if (e.type === HttpEventType.UploadProgress) {
              return {
                kind: 'progress',
                pct: Math.round((100 * e.loaded) / (e.total ?? 1)),
              };
            } else {
              // HttpEventType.Response ⇒ HttpResponse<BulkResult[]>
              return {
                kind: 'result',
                list: (e as HttpResponse<BulkResult[]>).body ?? [],
              };
            }
          }),
        )
    );
  }
}
