import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { NotifyService } from '../core/services/notify.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notify = inject(NotifyService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const esLogin = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (err.status === 401 && !esLogin && auth.isLoggedIn()) {
        auth.logout();
        notify.error('Tu sesión expiró, vuelve a iniciar sesión');
      }
      return throwError(() => err);
    }),
  );
};
