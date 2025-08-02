import { Routes } from '@angular/router';
import { Dash } from './layouts/dash/dash';
import { ImportXmlComponent } from './components/importacionxml/import-xml.component';
import { ListCfdiComponent } from './components/cfdi/list-cfdi.component';
import { PaymentsListComponent } from './components/payments/list-payments.component/list-payments.component';
import { PayrollListComponent } from './components/payrolls/payrolls-list.component/payrolls-list.component';
import { SummaryComponent } from './components/summary/resumen.component';
import { ReportsLayoutComponent } from './layouts/reports/reports.layout';

export const dashRoutes: Routes = [
  {
    path: '',
    component: Dash,
    children: [
      { path: '', pathMatch: 'full', component: SummaryComponent },
      { path: 'importacion-xml', component: ImportXmlComponent },
      { path: 'cfdis', component: ListCfdiComponent },
      { path: 'pagos', component: PaymentsListComponent },
      { path: 'nominas', component: PayrollListComponent },
      { path: 'reportes', component: ReportsLayoutComponent },
    ],
  },
];
