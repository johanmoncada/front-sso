import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

// Modern functional guard using signals
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    window.confirm(
      '⚠️ Acceso denegado.\n\nNo está autorizado para acceder a esta página.\nPor favor, inicie sesión.'
    );
    return router.createUrlTree(['/login']);
  }
};
