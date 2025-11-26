// src/app/components/cfdi/list-cfdi.component.ts
import { Component, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CfdiService, CfdiRow, DiotRow } from '../../services/cfdi.service';
import { AlertService } from '../../../ui/alert/services/alert.service';

const PAGES_PER_BLOCK = 20;

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

  // DIOT
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

  /** Páginas visibles en el paginador (en bloques de 20) */
  pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();

    if (total <= PAGES_PER_BLOCK) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const currentBlock = Math.floor((current - 1) / PAGES_PER_BLOCK);
    const start = currentBlock * PAGES_PER_BLOCK + 1;
    const end = Math.min(start + PAGES_PER_BLOCK - 1, total);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  // filtros
  desde = signal('');
  hasta = signal('');
  rfc = signal('');
  rfcReceptor = signal('');
  status = signal<string | null>(null);
  totalMin = signal<number>(0);
  totalMax = signal<number>(0);

  // UUID que viene del query param / filtro directo
  uuidFilter = signal<string | null>(null);

  constructor(
    private cfdiService: CfdiService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // auto-fetch cada vez que cambie algún filtro / página / uuidFilter
    effect(() => {
      this.fetchList();
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((qp) => {
      const initialRfc = qp.get('rfc');
      if (initialRfc) this.rfcReceptor.set(initialRfc);

      const initialUuid = qp.get('uuid');
      if (initialUuid) {
        // modo "enfocado" a un CFDI concreto
        this.uuidFilter.set(initialUuid);

        // abrir detalle de ese UUID (opcional, pero útil)
        this.cfdiService.getCfdiDetail(initialUuid).subscribe({
          next: (detail) => {
            this.selectedCfdi.set(detail);
          },
          error: () => {
            this.alertService.show(
              'No se pudo cargar el CFDI solicitado por UUID',
              'error',
            );
          },
        });
      }
    });
  }

  /* ---------------- helpers ---------------- */
  private fetchList() {
    this.loading.set(true);
    const uf = this.uuidFilter();

    // 🚩 MODO FOCALIZADO POR UUID: usamos SOLO el detalle
    if (uf) {
      this.cfdiService.getCfdiDetail(uf).subscribe({
        next: (detail) => {
          this.cfdis.set([detail]); // tabla con un único CFDI
          this.total.set(1);
          this.loading.set(false);
        },
        error: () => {
          this.cfdis.set([]);
          this.total.set(0);
          this.loading.set(false);
          this.alertService.show(
            `No se encontró CFDI con UUID ${uf}`,
            'warning',
          );
        },
      });
      return;
    }

    // 🌐 MODO NORMAL: listado paginado
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
        // sin uuid aquí: el filtro por uuid lo manejamos con getCfdiDetail arriba
      })
      .subscribe({
        next: (res) => {
          this.cfdis.set(res.data);
          this.total.set(res.pagination.total);
          this.loading.set(false);

          this.alertService.show(
            `Página ${res.pagination.page} / ${Math.ceil(
              res.pagination.total / res.pagination.limit,
            )}`,
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

  /* ---------------- modal detalles ---------------- */
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

    // actualizamos filtro + query param
    this.uuidFilter.set(uuid);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { uuid },
      queryParamsHandling: 'merge',
    });

    this.cfdiService.getCfdiDetail(uuid).subscribe({
      next: (detail) => {
        this.selectedCfdi.set(detail);
      },
      error: () => {
        this.alertService.show('Error al cargar detalles del CFDI', 'error');
      },
    });
  }

  /* ---------- Restaurar lista completa ---------- */
  restoreList() {
    this.uuidFilter.set(null);
    this.page.set(1);
    this.selectedCfdi.set(null);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { uuid: null },
      queryParamsHandling: 'merge',
    });
    // el effect vuelve a llamar fetchList() sin uuidFilter → listado normal
  }

  /* ---------- paginación ---------- */
  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update((v) => v + 1);
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update((v) => v - 1);
    }
  }

  goPage(p: number) {
    const total = this.totalPages();
    if (p >= 1 && p <= total) {
      this.page.set(p);
    }
  }

  goBlock(delta: number) {
    const target = this.page() + delta * PAGES_PER_BLOCK;
    this.goPage(target);
  }

  downloadXml(event: Event, uuid: string) {
    event.stopPropagation();
    this.cfdiService.downloadXml(uuid);
    this.alertService.show('Descargando XML...', 'info', 2000);
  }

  /* ----------------- Eliminar CFDI ----------------- */
  deleteCfdi(event: Event, uuid: string) {
    event.stopPropagation();
    this.cfdiService.deleteCfdi(uuid).subscribe({
      next: () => {
        this.alertService.show('CFDI eliminado correctamente', 'success');
        this.fetchList();
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
    this.cfdiService
      .getDiotReport(this.diotDesde(), this.diotHasta())
      .subscribe({
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
