import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AlertService } from '../../ui/alert/services/alert.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const alert = inject(AlertService);

  const token = localStorage.getItem('accessToken');
  if (!token) {
    alert.show('Debes iniciar sesión', 'warning');
    return router.parseUrl('/signin');
  }

  try {
    type JWTPayload = { exp: number };
    const { exp } = jwtDecode<JWTPayload>(token);

    // exp está en segundos
    if (Date.now() / 1000 > exp) {
      alert.show('Sesión expirada', 'warning');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return router.parseUrl('/signin');
    }

    // token válido
    return true;
  } catch {
    alert.show('Token inválido', 'error');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return router.parseUrl('/signin');
  }
};
