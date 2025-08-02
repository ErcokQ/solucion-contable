// src/app/components/cfdi/list-cfdi.component.ts
import { Component, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CfdiService, CfdiRow, DiotRow } from '../../services/cfdi.service';
import { AlertService } from '../../../ui/alert/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-list-cfdi',
  templateUrl: './list-cfdi.html',
  styleUrls: ['./list-cfdi.scss'],
  imports: [CommonModule, RouterModule],
})
export class ListCfdiComponent {
  /* -------- señales -------- */
  loading = signal<boolean>(true);
  cfdis = signal<CfdiRow[]>([]);
  error = signal<string | null>(null);
  selectedCfdi = signal<CfdiRow | null>(null);
  rows = signal<DiotRow[]>([]);
  diotError = signal<string | null>(null);
  showDiot = signal(false);
  diotLoading = signal(false);
  diotDesde = signal('');
  diotHasta = signal('');

  /* ------------------------------ paginación ------------------------------ */
  page = signal<number>(1);
  limit = signal<number>(20);
  total = signal<number>(0);
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.limit())),
  );

  /** Array 1..n para el *ngFor* de la paginación */
  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  // filtros
  desde = signal('');
  hasta = signal('');
  rfc = signal('');
  rfcReceptor = signal('');
  status = signal<string | null>(null);
  totalMin = signal<number>(0);
  totalMax = signal<number>(0);

  constructor(
    private cfdiService: CfdiService,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {
    effect(() => {
      this.fetchList();
    });
  }

  ngOnInit() {
    const initialRfc = this.route.snapshot.queryParamMap.get('rfc');
    if (initialRfc) this.rfcReceptor.set(initialRfc);
  }

  /* ---------------- helpers ---------------- */
  private fetchList() {
    this.loading.set(true);
    this.cfdiService
      .listCfdis({
        fechaDesde: this.desde() || undefined,
        fechaHasta: this.hasta() || undefined,
        rfc: this.rfc() || undefined,
        rfcReceptor: this.rfcReceptor() || undefined,
        status: this.status() || undefined,
        page: this.page(),
        limit: this.limit(),
        totalMin: this.totalMin() || undefined,
        totalMax: this.totalMax() || undefined,
      })
      .subscribe({
        next: (res) => {
          /* res: { data: CfdiRow[]; pagination: { total, page, limit } } */
          this.cfdis.set(res.data);
          this.total.set(res.pagination.total);
          this.loading.set(false);
          this.alertService.show(
            `Página ${res.pagination.page} / ${Math.ceil(res.pagination.total / res.pagination.limit)}`,
            'success',
          );
        },
        error: () => {
          this.error.set('Error al cargar CFDIs');
          this.loading.set(false);
          this.alertService.show('Error al cargar CFDIs', 'error');
        },
      });
  }

  /* ---------------- modale detalles ---------------- */
  onRowClick(cfdi: CfdiRow) {
    this.selectedCfdi.set(cfdi);
    this.cfdiService.getCfdiDetail(cfdi.uuid).subscribe({
      next: (detail) => {
        this.alertService.show(
          `Detalles del CFDI ${cfdi.uuid} cargados`,
          'info',
        );
        this.selectedCfdi.set(detail);
      },
      error: () => {
        this.alertService.show('Error al cargar detalles del CFDI', 'error');
      },
    });
  }

  closeDetail() {
    this.selectedCfdi.set(null);
  }

  goToUuid(uuid?: string | null) {
    if (!uuid) return;
    this.onRowClick({ uuid } as unknown as CfdiRow);
  }

  /* ---------- paginación ---------- */
  nextPage() {
    if (this.page() < this.totalPages()) this.page.update((v) => v + 1);
  }
  prevPage() {
    if (this.page() > 1) this.page.update((v) => v - 1);
  }
  goPage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }

  downloadXml(evet: Event, uuid: string) {
    evet.stopPropagation();
    this.cfdiService.downloadXml(uuid);
    this.alertService.show('Descargando XML...', 'info', 2000);
  }

  /* ----------------- Eliminar CFDI ----------------- */
  deleteCfdi(event: Event, uuid: string) {
    event.stopPropagation();
    this.cfdiService.deleteCfdi(uuid).subscribe({
      next: () => {
        this.alertService.show('CFDI eliminado correctamente', 'success');
        this.fetchList(); // Refrescar lista
      },
      error: () => {
        this.alertService.show('Error al eliminar CFDI', 'error');
      },
    });
  }

  /* ----------------- Reporte DIOT ----------------- */
  openDiotModal() {
    this.showDiot.set(true);
  }
  closeDiot() {
    this.showDiot.set(false);
  }

  reporteDiot() {
    if (!this.diotDesde() || !this.diotHasta()) {
      this.alertService.show('Seleccione rango de fechas', 'warning');
      return;
    }
    this.diotLoading.set(true);
    this.cfdiService.getDiotReport(this.desde(), this.hasta()).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.diotLoading.set(false);
      },
      error: () => {
        this.diotError.set('Error al generar DIOT');
        this.diotLoading.set(false);
      },
    });
  }
}
