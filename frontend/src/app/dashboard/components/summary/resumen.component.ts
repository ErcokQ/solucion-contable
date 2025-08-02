// -------- src/app/components/summary/summary.component.ts --------
import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  SummaryService,
  DashboardSummary,
} from '../../services/summary.service';
import { AlertService } from '../../../ui/alert/services/alert.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-summary',
  imports: [CommonModule, RouterModule],
  templateUrl: './resumen.html',
  styleUrls: ['./resumen.scss'],
})
export class SummaryComponent {
  loading = signal<boolean>(true);
  data = signal<DashboardSummary | null>(null);
  error = signal<string | null>(null);

  // Rango (por defecto mes en curso)
  desde = signal<string>('');
  hasta = signal<string>('');

  constructor(
    private svc: SummaryService,
    private alert: AlertService,
  ) {
    effect(() => this.fetch());
  }

  fetch() {
    console.log(this.desde(), this.hasta());
    this.loading.set(true);
    this.svc
      .getSummary({
        fechaDesde: this.desde() || undefined,
        fechaHasta: this.hasta() || undefined,
      })
      .subscribe({
        next: (d) => {
          this.data.set(d);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar resumen');
          this.loading.set(false);
          this.alert.show('Error al cargar resumen', 'error');
        },
      });
  }

  kpi(name: keyof DashboardSummary['kpis']) {
    return computed(() => this.data()?.kpis[name] ?? 0);
  }
}
