// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dash.routes').then((m) => m.dashRoutes),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
