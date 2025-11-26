// src/app/dashboard/components/payments/payments-list.component.ts
import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  PaymentsService,
  PaymentDetail,
  PaymentRow,
} from '../../../services/payment.service';
import { AlertService } from '../../../../ui/alert/services/alert.service';

const PAGES_PER_BLOCK = 20;

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

  /** Si viene desde el reporte con ?paymentId=XXX */
  paymentId = signal<number | null>(null);

  /* ------------- filters ------------- */
  rfc = signal('');
  desde = signal('');
  hasta = signal('');

  /* ------------- paginación ------------- */
  page = signal(1);
  limit = signal(20);
  total = signal(0);

  totalPages = computed(() => {
    const perPage = Number(this.limit()) || 1;
    return Math.max(1, Math.ceil(this.total() / perPage));
  });

  /** Páginas visibles (bloques de 20) */
  pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const blockSize = PAGES_PER_BLOCK;

    if (total <= blockSize) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const currentBlock = Math.floor((current - 1) / blockSize);
    const start = currentBlock * blockSize + 1;
    const end = Math.min(start + blockSize - 1, total);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  constructor(
    private payments: PaymentsService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    /* auto-fetch lista normal sólo cuando NO estamos en modo paymentId */
    effect(() => {
      if (this.paymentId() !== null) return; // 👈 modo detalle, no listar
      this.fetch();
    });

    /* leer ?paymentId=XXX y cargar modo detalle */
    this.route.queryParamMap.subscribe((params) => {
      const idParam = params.get('paymentId');
      const id = idParam ? Number(idParam) : NaN;

      if (!Number.isNaN(id)) {
        this.loadPaymentFromQuery(id);
      }
    });
  }

  /* ------------ LIST NORMAL ------------ */
  fetch() {
    this.loading.set(true);
    this.payments
      .listPayments({
        rfcReceptor: this.rfc() || undefined,
        fechaDesde: this.desde() || undefined,
        fechaHasta: this.hasta() || undefined,
        page: this.page(),
        limit: Number(this.limit()),
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

  /* ------------ MODO DETAIL DESDE QUERY PARAM ------------ */
  private loadPaymentFromQuery(id: number) {
    this.paymentId.set(id); // activa “modo detalle”
    this.loading.set(true);

    this.payments.getPaymentDetail(id).subscribe({
      next: (d) => {
        // abrimos el modal
        this.selected.set(d);

        // y filtramos la tabla a sólo ese pago
        const row: PaymentRow = {
          id: d.id,
          fechaPago: d.fechaPago,
          rfcReceptor: d.cfdiHeader.rfcReceptor,
          rfcEmisor: d.cfdiHeader.rfcEmisor,
          cfdiUuid: d.cfdiHeader.uuid,
          monto: d.monto,
          moneda: d.moneda,
          formaPago: d.formaPago,
        };

        this.rows.set([row]);
        this.total.set(1);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (_) => {
        this.alert.show('Error al cargar pago desde URL', 'error');
        this.loading.set(false);
      },
    });
  }

  /* ------------ detalle normal desde la tabla ------------ */
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
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
    }
  }

  next() {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
    }
  }

  go(p: number) {
    const total = this.totalPages();
    if (p >= 1 && p <= total) {
      this.page.set(p);
    }
  }

  /** Saltar un bloque completo de páginas (20 en 20) */
  goBlock(delta: number) {
    const target = this.page() + delta * PAGES_PER_BLOCK;
    this.go(target);
  }

  restoreList() {
    // cerramos modal por si está abierto
    this.selected.set(null);

    // salimos del modo "detalle desde reporte"
    this.paymentId.set(null);

    // quitamos paymentId de la URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { paymentId: null },
      queryParamsHandling: 'merge',
    });

    // opcional: regresar a página 1
    this.page.set(1);
  }
}
