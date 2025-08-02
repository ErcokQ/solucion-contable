// ------------------------------
// src/app/dashboard/components/payroll/payroll-list.component.ts
// ------------------------------
import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PayrollService,
  PayrollRow,
  PayrollDetail,
} from '../../../services/payroll.service';
import { AlertService } from '../../../../ui/alert/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-payroll-list',
  templateUrl: './payrolls-list.component.html',
  styleUrls: ['./payrolls-list.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class PayrollListComponent {
  loading = signal(true);
  rows = signal<PayrollRow[]>([]);
  error = signal<string | null>(null);
  selected = signal<PayrollDetail | null>(null);

  /* filtros */
  rfc = signal('');
  desde = signal('');
  hasta = signal('');
  tipo = signal<'O' | 'E' | ''>('');
  page = signal(1);
  limit = signal(20);
  total = signal(0);
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.limit())),
  );
  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  constructor(
    private payroll: PayrollService,
    private alert: AlertService,
  ) {
    effect(() => {
      this.fetch();
    });
  }

  /* ---------------- obtener lista ---------------- */
  fetch() {
    this.loading.set(true);
    this.payroll
      .listPayrolls({
        rfcReceptor: this.rfc() || undefined,
        fechaDesde: this.desde() || undefined,
        fechaHasta: this.hasta() || undefined,
        tipoNomina: this.tipo() || (undefined as any),
        page: this.page(),
        limit: this.limit(),
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.data);
          this.total.set(res.pagination.total);
          this.loading.set(false);
        },
        error: (_) => {
          this.error.set('Error al cargar nóminas');
          this.loading.set(false);
        },
      });
  }

  open(row: PayrollRow) {
    this.payroll.getPayrollDetail(row.id).subscribe({
      next: (d) => this.selected.set(d),
      error: (_) => this.alert.show('Error al cargar detalle', 'error'),
    });
  }
  close() {
    this.selected.set(null);
  }

  prev() {
    if (this.page() > 1) this.page.update((p) => p - 1);
  }
  next() {
    if (this.page() < this.totalPages()) this.page.update((p) => p + 1);
  }
  go(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }
}
