// src/app/components/reports/cfdi-report.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, CfdiReportRow } from '../../../services/report.service';
import { AlertService } from '../../../../ui/alert/services/alert.service';

type TipoCfdi = 'emitidos' | 'recibidos' | 'cancelados';

@Component({
  standalone: true,
  selector: 'app-cfdi-report',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  imports: [CommonModule],
})
export class CfdiReportsComponent {
  /* ---------------- filtros ---------------- */
  fechaDesde = signal('');
  fechaHasta = signal('');
  tipo = signal<TipoCfdi>('emitidos');
  /**
   * RFC del usuario (se envía como *rfcEmisor* al backend y
   * sirve de referencia para determinar “emitidos” vs “recibidos”)
   */
  rfc = signal('');

  /* ---------------- estado UI -------------- */
  loading = signal(false);
  rows = signal<CfdiReportRow[]>([]);
  error = signal<string | null>(null);

  constructor(
    private reports: ReportService,
    private alert: AlertService,
  ) {}

  /* ======== acciones ======== */

  fetch(): void {
    this.error.set(null);

    if (!this.rfc()) {
      // 🚫 sin RFC => nada que buscar
      this.alert.show('Ingresa tu RFC para filtrar', 'warning', 2500);
      return;
    }

    this.loading.set(true);

    this.reports
      .getCfdiReportJSON({
        fechaDesde: this.fechaDesde() || undefined,
        fechaHasta: this.fechaHasta() || undefined,
        tipo: this.tipo(),
        rfc: this.rfc(), // <- único RFC
      })
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al generar reporte');
          this.loading.set(false);
        },
      });
  }

  exportXlsx(): void {
    if (!this.rfc()) {
      this.alert.show('Ingresa tu RFC primero', 'warning', 2500);
      return;
    }

    this.loading.set(true);

    this.reports
      .downloadCfdiReportXlsx({
        fechaDesde: this.fechaDesde() || undefined,
        fechaHasta: this.fechaHasta() || undefined,
        tipo: this.tipo(),
        rfc: this.rfc(),
      })
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-cfdi-${Date.now()}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.loading.set(false);
          this.alert.show('Archivo XLSX generado', 'success', 2000);
        },
        error: () => {
          this.alert.show('Error al generar XLSX', 'error');
          this.loading.set(false);
        },
      });
  }
}
