import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, TotalesRfcRow } from '../../../services/report.service';
import { AlertService } from '../../../../ui/alert/services/alert.service';

type Tipo = 'emitidos' | 'recibidos';

@Component({
  standalone: true,
  selector: 'app-totales-rfc-report',
  imports: [CommonModule],
  templateUrl: './totales-rfc-report.component.html',
  styleUrls: ['./totales-rfc-report.component.scss'],
})
export class TotalesRfcReportComponent {
  /* filtros */
  fechaDesde = signal('');
  fechaHasta = signal('');
  tipo = signal<Tipo>('emitidos');
  rfc = signal('');
  origen = signal<'todos' | 'nomina' | 'factura'>('todos');
  agruparGlobal = signal(false);

  /* estado UI */
  loading = signal(false);
  rows = signal<TotalesRfcRow[]>([]);
  error = signal<string | null>(null);

  constructor(
    private reports: ReportService,
    private alert: AlertService,
  ) {}

  fetch() {
    if (!this.rfc()) return this.alert.show('Ingresa RFC', 'warning');
    this.loading.set(true);

    this.reports
      .getTotalesRfcJSON({
        fechaDesde: this.fechaDesde() || undefined,
        fechaHasta: this.fechaHasta() || undefined,
        tipo: this.tipo(),
        rfc: this.rfc(),
        origen: this.origen(),
        agruparGlobal: this.agruparGlobal(),
      })
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error');
          this.loading.set(false);
        },
      });
  }

  exportXlsx() {
    if (!this.rows().length) return;
    this.loading.set(true);

    this.reports
      .downloadTotalesRfcXlsx({
        fechaDesde: this.fechaDesde() || undefined,
        fechaHasta: this.fechaHasta() || undefined,
        tipo: this.tipo(),
        rfc: this.rfc(),
        origen: this.origen(),
        agruparGlobal: this.agruparGlobal(),
      })
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-totales-${Date.now()}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.loading.set(false);
        },
        error: () => {
          this.alert.show('Error XLSX', 'error');
          this.loading.set(false);
        },
      });
  }
}
