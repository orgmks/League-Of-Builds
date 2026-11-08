import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinnerModule],
  template: `
    <mat-progress-spinner mode="indeterminate" diameter="40" />
    <span>{{ label() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px 0;
      color: var(--muted);
    }
  `,
})
export class Loading {
  readonly label = input('Cargando…');
}
