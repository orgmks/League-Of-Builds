import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasValidSession()) {
    return true;
  }
  // si había un token vencido lo limpiamos antes de mandar al login
  auth.logout(false);
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Evita que alguien ya logueado vuelva a ver login o registro. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.hasValidSession() ? inject(Router).createUrlTree(['/inicio']) : true;
};
