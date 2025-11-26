// reports/components/reports-layout/reports-layout.component.ts
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CfdiReportsComponent } from '../../components/reports/cfdi-report/reports.component';
import { IvaReportComponent } from '../../components/reports/iva-report/iva-report.component';
import { TotalesRfcReportComponent } from '../../components/reports/totals-rfc-report/totales-rfc-report.component';
import { PayrollReportComponent } from '../../components/reports/payroll-report/payroll-report.component';
import { PagosPueReportComponent } from '../../components/reports/pagos-pue-report.component.ts/pagos-pue-report.component';
import { FacturasPueRaizReportComponent } from '../../components/reports/facturas-pue-raiz-report/facturas-pue-raiz-report.component';

type Tab = {
  id: 'cfdi' | 'iva' | 'totales' | 'nomina' | 'pagos-pue' | 'pue-raiz';
  label: string;
};

@Component({
  standalone: true,
  selector: 'app-reports-layout',
  imports: [
    RouterModule,
    CfdiReportsComponent,
    IvaReportComponent,
    TotalesRfcReportComponent,
    PayrollReportComponent,
    PagosPueReportComponent,
    FacturasPueRaizReportComponent,
  ],
  templateUrl: './reports.layout.html',
  styleUrl: './reports.layout.scss',
})
export class ReportsLayoutComponent {
  readonly tabs: Tab[] = [
    { id: 'cfdi', label: 'CFDI' },
    { id: 'iva', label: 'IVA' },
    { id: 'totales', label: 'Totales por RFC' },
    { id: 'nomina', label: 'Reporte nomina detallado' },
    { id: 'pagos-pue', label: 'Pagos con PUE' },
    { id: 'pue-raiz', label: 'PUE raíz' },
  ];
  active = signal<Tab['id']>('cfdi');
}
