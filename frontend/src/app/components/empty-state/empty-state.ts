import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  template: `
    <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
    <h3>{{ title() }}</h3>
    @if (message()) {
      <p>{{ message() }}</p>
    }
    <div class="actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 48px 16px;
      border: 1px dashed var(--line);
      border-radius: 12px;
      color: var(--muted);
    }
    mat-icon {
      font-size: 44px;
      width: 44px;
      height: 44px;
      color: var(--gold);
      margin-bottom: 8px;
    }
    h3 {
      color: var(--mat-sys-on-surface);
      font-size: 1.15rem;
    }
    p {
      margin: 6px 0 0;
      max-width: 420px;
    }
    .actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }
    .actions:empty {
      display: none;
    }
  `,
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly title = input.required<string>();
  readonly message = input('');
}
