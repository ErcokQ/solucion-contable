import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImportService } from '../../services/import.service';
import { AlertService } from '../../../ui/alert/services/alert.service';
import { BulkResult } from '../../services/import.service';

/* ---------- modelo ---------- */
export interface Pending {
  file: File;
  progress: number; // 0-100 durante la subida
  status: 'pending' | 'uploading' | 'completed' | 'error';
  type: 'xml' | 'zip';
  report?: BulkResult[];
}

type BulkStatus = 'enqueued' | 'already_imported' | 'invalid_xml';
type StatusCount = Record<BulkStatus, number>;

@Component({
  standalone: true,
  selector: 'app-import-xml',
  templateUrl: './import-xml.component.html',
  styleUrls: ['./import-xml.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class ImportXmlComponent {
  /* ----- señales de estado ----- */
  pending = signal<Pending[]>([]);
  isDrag = signal<boolean>(false);

  canUpload = computed(
    () =>
      this.pending().some((p) => p.status === 'pending') && !this.isUploading(),
  );

  /** indica si hay algún archivo subiendo */
  private isUploading() {
    return this.pending().some((p) => p.status === 'uploading');
  }

  report = signal<{
    list: BulkResult[];
    counts: {
      enqueued: number;
      already_imported: number;
      invalid_xml: number;
    };
  } | null>(null);

  constructor(
    private api: ImportService,
    private alert: AlertService,
  ) {}

  /* ------ modal de reporte ------ */
  openReport(list: BulkResult[]) {
    const counts = {
      enqueued: list.filter((r) => r.status === 'enqueued').length,
      already_imported: list.filter((r) => r.status === 'already_imported')
        .length,
      invalid_xml: list.filter((r) => r.status === 'invalid_xml').length,
    };
    this.report.set({ list, counts });
  }
  closeReport() {
    this.report.set(null);
  }

  /* ---------- drag helpers ---------- */
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDrag.set(true);
  }
  onDragLeave() {
    this.isDrag.set(false);
  }

  /* ---------- drop ---------- */
  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDrag.set(false);

    const files = Array.from(e.dataTransfer?.files ?? []);
    if (!files.length) return;

    const xmls = files.filter((f) => f.name.toLowerCase().endsWith('.xml'));
    const zips = files.filter((f) => f.name.toLowerCase().endsWith('.zip'));

    [...xmls, ...zips].forEach((file) =>
      this.pending.update((p) => [
        ...p,
        {
          file,
          progress: 0,
          status: 'pending',
          type: file.name.toLowerCase().endsWith('.zip') ? 'zip' : 'xml',
        },
      ]),
    );

    if (!xmls.length && !zips.length) {
      this.alert.show('Sólo XML o ZIP', 'warning');
    }
  }

  /* ---------- selección ZIP manual ---------- */
  onZip(zip?: File) {
    if (!zip || !zip.name.endsWith('.zip')) {
      return this.alert.show('Sólo ZIP', 'warning');
    }
    this.pending.update((p) => [
      ...p,
      { file: zip, progress: 0, status: 'pending', type: 'zip' },
    ]);
  }

  /* ---------- selección XML manual ---------- */
  onFiles(files: File[] | FileList | null) {
    const list = Array.from(files ?? []).filter((f) =>
      f.name.toLowerCase().endsWith('.xml'),
    );
    if (!list.length) return this.alert.show('Sólo XML', 'warning');

    this.pending.update((arr): Pending[] => [
      ...arr,
      ...list.map(
        (file): Pending => ({
          file,
          progress: 0,
          status: 'pending' as const,
          type: 'xml' as const,
        }),
      ),
    ]);
  }

  /* ---------- quitar fila ---------- */
  remove(i: number) {
    this.pending.update((arr) => {
      const item = arr[i];
      // bloquea si está subiendo
      if (item?.status === 'uploading') return arr;
      return arr.filter((_, idx) => idx !== i);
    });
  }

  uploadAll() {
    /* 1) marcar los que están pendientes como “uploading” */
    this.pending.update((arr) =>
      arr.map((p) =>
        p.status === 'pending' ? { ...p, status: 'uploading' } : p,
      ),
    );

    /* 2) recorrer cada fila y lanzar su petición */
    this.pending().forEach((p, i) => {
      /** actualiza únicamente el porcentaje */
      const updatePct = (pct: number) =>
        this.pending.update((a) => {
          const c = [...a];
          c[i] = { ...c[i], progress: pct };
          return c;
        });

      /** finaliza: completed / error y muestra alerta si falla */
      const finish = (ok: boolean, msg?: string) =>
        this.pending.update((a) => {
          const c = [...a];
          c[i] = { ...c[i], status: ok ? 'completed' : 'error', progress: 100 };
          if (!ok) this.alert.show(msg ?? `Error en ${p.file.name}`, 'error');
          return c;
        });

      /* ---------- XML ---------- */
      if (p.type === 'xml') {
        this.api.uploadXml(p.file).subscribe({
          next: (pct) => updatePct(pct),
          error: (err) => finish(false, err?.error?.error),
          complete: () => finish(true),
        });
      }

      /* ---------- ZIP ---------- */
      if (p.type === 'zip') {
        this.api.uploadZip(p.file).subscribe({
          next: (ev) => {
            if (ev.kind === 'progress') updatePct(ev.pct);

            if (ev.kind === 'result') {
              /* guardamos el reporte en la fila */
              this.pending.update((a) => {
                const c = [...a];
                c[i] = { ...c[i], report: ev.list };
                return c;
              });

              /* construimos resumen y lo mostramos al usuario */
              const counts = ev.list.reduce<StatusCount>(
                (acc, r) => {
                  // narrow: sólo si r.status coincide con las claves permitidas
                  if (
                    r.status === 'enqueued' ||
                    r.status === 'already_imported' ||
                    r.status === 'invalid_xml'
                  ) {
                    acc[r.status] = (acc[r.status] ?? 0) + 1;
                  }
                  return acc;
                },
                { enqueued: 0, already_imported: 0, invalid_xml: 0 },
              );

              const msg = `
                      ZIP «${p.file.name}»
                      ✔️ Encolados: ${counts.enqueued}
                      🔄 Ya importados: ${counts.already_imported}
                      ⛔ Inválidos: ${counts.invalid_xml}
              `;
              this.alert.show(msg.trim(), 'info');
            }
          },
          error: (err) => finish(false, err?.error?.error),
          complete: () => finish(true),
        });
      }
    });

    /* 3) feedback inicial */
    if (this.pending().length) this.alert.show('Carga iniciada', 'info');
  }
}
