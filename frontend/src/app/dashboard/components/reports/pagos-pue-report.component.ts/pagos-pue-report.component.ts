import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ReportService, PagosPueRow } from '../../../services/report.service';
import { AlertService } from '../../../../ui/alert/services/alert.service';

type TipoPagos = 'emitidos' | 'recibidos';

@Component({
  standalone: true,
  selector: 'app-pagos-pue-report',
  templateUrl: './pagos-pue-report.component.html',
  styleUrls: ['./pagos-pue-report.component.scss'],
  imports: [CommonModule],
})
export class PagosPueReportComponent {
  /* ───────── filtros ───────── */
  fechaDesde = signal('');
  fechaHasta = signal('');
  tipo = signal<TipoPagos>('emitidos');
  rfc = signal('');

  /* ───────── estado UI ─────── */
  loading = signal(false);
  rows = signal<PagosPueRow[]>([]);
  error = signal<string | null>(null);

  constructor(
    private reports: ReportService,
    private alert: AlertService,
  ) {}

  fetch(): void {
    this.error.set(null);

    if (!this.rfc()) {
      this.alert.show('Ingresa tu RFC para filtrar', 'warning', 2500);
      return;
    }

    this.loading.set(true);

    this.reports
      .getPagosPueJSON({
        fechaDesde: this.fechaDesde() || undefined,
        fechaHasta: this.fechaHasta() || undefined,
        tipo: this.tipo(),
        rfc: this.rfc(),
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
      .downloadPagosPueXlsx({
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
          a.download = `reporte-pagos-pue-${Date.now()}.xlsx`;
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
