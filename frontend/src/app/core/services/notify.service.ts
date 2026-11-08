import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly snack = inject(MatSnackBar);

  ok(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 3000, panelClass: 'snack-ok' });
  }

  error(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
  }
}
