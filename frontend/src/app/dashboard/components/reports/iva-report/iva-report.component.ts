// src/app/components/reports/iva-report/iva-report.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, IvaReportRow } from '../../../services/report.service';
import { AlertService } from '../../../../ui/alert/services/alert.service';

type TipoIva = 'emitidos' | 'recibidos';

@Component({
  standalone: true,
  selector: 'app-iva-report',
  imports: [CommonModule],
  templateUrl: './iva-report.component.html',
  styleUrls: ['./iva-report.component.scss'],
})
export class IvaReportComponent {
  /* filtros */
  fechaDesde = signal('');
  fechaHasta = signal('');
  tipo = signal<TipoIva>('emitidos');
  rfc = signal('');

  /* estado */
  loading = signal(false);
  rows = signal<IvaReportRow[]>([]);
  error = signal<string | null>(null);

  constructor(
    private reports: ReportService,
    private alert: AlertService,
  ) {}

  fetch() {
    if (!this.rfc()) {
      this.alert.show('Ingresa RFC', 'warning');
      return;
    }
    this.loading.set(true);
    this.reports
      .getIvaReportJSON({
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
          this.error.set('Error');
          this.loading.set(false);
        },
      });
  }

  exportXlsx() {
    if (!this.rows().length) return;
    this.loading.set(true);
    this.reports
      .downloadIvaReportXlsx({
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
          a.download = `reporte-iva-${Date.now()}.xlsx`;
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
