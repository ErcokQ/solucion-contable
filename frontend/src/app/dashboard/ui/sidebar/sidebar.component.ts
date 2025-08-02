import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { AlertService } from '../../../ui/alert/services/alert.service';

interface MenuItem {
  icon: string;
  label: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
    private alert: AlertService,
  ) {}

  menu: MenuItem[] = [
    { icon: '📊', label: 'Resumen', link: '/dashboard' },

    /* ——— Módulos de negocio ——— */
    { icon: '📁', label: 'CFDIs', link: '/dashboard/cfdis' },
    { icon: '💰', label: 'Pagos', link: '/dashboard/pagos' },
    { icon: '🧾', label: 'Nóminas', link: '/dashboard/nominas' },

    /* ——— Procesos e informes ——— */
    { icon: '⬆️', label: 'Importar XML', link: '/dashboard/importacion-xml' },
    { icon: '📈', label: 'Reportes SAT', link: '/dashboard/reportes' },

    /* ——— Administración ——— */
    // { icon: '👥', label: 'Usuarios',      link: '/dashboard/usuarios' },   // (solo si rol admin)
    // { icon: '⚙️', label: 'Configuración', link: '/dashboard/configuracion' },
  ];

  onLogout() {
    this.auth.logout().subscribe({
      complete: () => this.router.navigate(['/signin']),
      error: () => this.router.navigate(['/signin']),
    });
  }
}
