import { HttpErrorResponse } from '@angular/common/http';

/** Saca un mensaje legible de lo que devuelva FastAPI (string o lista de errores 422). */
export function apiErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor';
  }
  const detail = err.error?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    const campo = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : '';
    return campo ? `${campo}: ${first.msg}` : first.msg;
  }
  return fallback;
}
