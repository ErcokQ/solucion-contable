// src/app/components/reports/payroll-report/payroll-report.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReportService,
  PayrollReportRow,
} from '../../../services/report.service';
import { AlertService } from '../../../../ui/alert/services/alert.service';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';

@Component({
  standalone: true,
  selector: 'app-payroll-report',
  templateUrl: './payroll-report.component.html',
  styleUrls: ['./payroll-report.component.scss'],
  imports: [CommonModule, MoneyPipe],
})
export class PayrollReportComponent {
  /* filtros */
  fechaDesde = signal('');
  fechaHasta = signal('');
  rfc = signal('');

  /* estado */
  loading = signal(false);
  rows = signal<PayrollReportRow[]>([]);
  error = signal<string | null>(null);

  constructor(
    private reports: ReportService,
    private alert: AlertService,
  ) {}

  fetch() {
    this.error.set(null);

    if (!this.rfc()) {
      this.alert.show('Ingresa RFC emisor', 'warning');
      return;
    }

    this.loading.set(true);

    this.reports
      .getPayrollReportJSON({
        rfc: this.rfc(),
        fechaDesde: this.fechaDesde() || undefined,
        fechaHasta: this.fechaHasta() || undefined,
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

  exportXlsx() {
    if (!this.rows().length) return;

    this.loading.set(true);
    this.reports
      .downloadPayrollReportXlsx({
        rfc: this.rfc(),
        fechaDesde: this.fechaDesde() || undefined,
        fechaHasta: this.fechaHasta() || undefined,
      })
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte-nomina-${Date.now()}.xlsx`;
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
