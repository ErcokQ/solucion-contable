// src/app/dashboard/components/payments/payments-list.component.ts
import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PaymentsService,
  PaymentDetail,
  PaymentRow,
} from '../../../services/payment.service';
import { AlertService } from '../../../../ui/alert/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-payments-list',
  templateUrl: './list-payments.component.html',
  styleUrls: ['./list-payments.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class PaymentsListComponent {
  /* ----------- state ----------- */
  loading = signal(true);
  rows = signal<PaymentRow[]>([]);
  error = signal<string | null>(null);
  selected = signal<PaymentDetail | null>(null);

  /* ------------- filters ------------- */
  rfc = signal('');
  desde = signal('');
  hasta = signal('');
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
    private payments: PaymentsService,
    private alert: AlertService,
  ) {
    /* auto-fetch cada vez que cambie un filtro o la página */
    effect(() => {
      this.fetch();
    });
  }

  /* ------------ CRUD ------------ */
  fetch() {
    this.loading.set(true);
    this.payments
      .listPayments({
        rfcReceptor: this.rfc() || undefined,
        fechaDesde: this.desde() || undefined,
        fechaHasta: this.hasta() || undefined,
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
          this.error.set('Error al cargar pagos');
          this.loading.set(false);
        },
      });
  }

  openDetail(row: PaymentRow) {
    this.payments.getPaymentDetail(row.id).subscribe({
      next: (d) => this.selected.set(d),
      error: (_) => this.alert.show('Error al cargar detalle', 'error'),
    });
  }
  closeDetail() {
    this.selected.set(null);
  }

  /* ---------- paginator ---------- */
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
