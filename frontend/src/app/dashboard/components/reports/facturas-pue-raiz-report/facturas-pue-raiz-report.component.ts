// src/app/components/reports/facturas-pue-raiz-report.component.ts
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  ReportService,
  FacturaPueRaizRow,
} from '../../../services/report.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../../ui/alert/services/alert.service';

type TipoCfdi = 'emitidos' | 'recibidos';

@Component({
  standalone: true,
  selector: 'app-facturas-pue-raiz-report',
  templateUrl: './facturas-pue-raiz-report.component.html',
  styleUrls: ['./facturas-pue-raiz-report.component.scss'],
  imports: [CommonModule],
})
export class FacturasPueRaizReportComponent {
  /* filtros */
  fechaDesde = signal('');
  fechaHasta = signal('');
  tipo = signal<TipoCfdi>('emitidos');
  rfc = signal('');

  /* estado UI */
  loading = signal(false);
  rows = signal<FacturaPueRaizRow[]>([]);
  error = signal<string | null>(null);

  constructor(
    private reports: ReportService,
    private alert: AlertService,
    private router: Router,
  ) {}

  irAPago(row: FacturaPueRaizRow): void {
    const id = Number(row.primerPagoId);
    if (!id) {
      this.alert.show(
        'No se pudo determinar el pago asociado',
        'warning',
        2500,
      );
      return;
    }

    this.router.navigate(['/dashboard/pagos'], {
      queryParams: { paymentId: id },
    });
  }

  buscar(): void {
    this.error.set(null);

    if (!this.rfc()) {
      this.alert.show('Ingresa tu RFC para filtrar', 'warning', 2500);
      return;
    }

    this.loading.set(true);

    this.reports
      .getFacturasPueRaizJSON({
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

  exportarXlsx(): void {
    if (!this.rfc()) {
      this.alert.show('Ingresa tu RFC primero', 'warning', 2500);
      return;
    }

    this.loading.set(true);

    this.reports
      .downloadFacturasPueRaizXlsx({
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
          a.download = `reporte-facturas-pue-raiz-${Date.now()}.xlsx`;
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
