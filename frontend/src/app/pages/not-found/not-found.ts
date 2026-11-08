import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../components/empty-state/empty-state';

@Component({
  selector: 'app-not-found',
  imports: [EmptyState, MatButtonModule, RouterLink],
  template: `
    <div class="wrap">
      <app-empty-state icon="explore_off" title="Esta página no existe" message="La dirección que abriste no corresponde a ninguna sección de LoL Hub.">
        <a mat-flat-button routerLink="/inicio">Volver al inicio</a>
      </app-empty-state>
    </div>
  `,
  styles: `
    .wrap {
      max-width: 560px;
      margin: 15vh auto 0;
      padding: 0 20px;
    }
  `,
})
export class NotFound {}
