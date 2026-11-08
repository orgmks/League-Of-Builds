import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { ChampionAvatar } from '../../components/champion-avatar/champion-avatar';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { BuildFormDialog } from '../../components/build-form-dialog/build-form-dialog';
import { EmptyState } from '../../components/empty-state/empty-state';
import { Loading } from '../../components/loading/loading';
import { Build } from '../../core/models';
import { BuildsService } from '../../core/services/builds.service';
import { ChampionsService } from '../../core/services/champions.service';
import { NotifyService } from '../../core/services/notify.service';
import { apiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-build-detail',
  imports: [DatePipe, RouterLink, MatCardModule, MatButtonModule, MatIconModule, ChampionAvatar, EmptyState, Loading],
  templateUrl: './build-detail.html',
  styleUrl: './build-detail.scss',
})
export class BuildDetail {
  private readonly api = inject(BuildsService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  private readonly champions = inject(ChampionsService);

  /** parámetro :id de la ruta */
  readonly id = input.required<string>();

  protected readonly build = this.api.detailResource(() => Number(this.id()) || undefined);
  protected readonly niveles = [1, 2, 3, 4, 5];
  protected readonly splash = computed(() => {
    const b = this.build.value();
    return b ? `url(${this.champions.splashUrl(b.champion.image_key)})` : 'none';
  });
  protected readonly notFound = computed(() => (this.build.error() as { status?: number } | undefined)?.status === 404);

  toggleFavorite(b: Build): void {
    this.api.setFavorite(b.id, !b.is_favorite).subscribe({
      next: () => this.build.reload(),
      error: (err) => this.notify.error(apiErrorMessage(err)),
    });
  }

  edit(b: Build): void {
    this.dialog
      .open(BuildFormDialog, { data: { build: b }, maxWidth: '95vw' })
      .afterClosed()
      .subscribe((saved?: Build) => {
        if (saved) this.build.reload();
      });
  }

  remove(b: Build): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: 'Eliminar build',
          message: `Se eliminará "${b.title}" de forma permanente. Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar',
        },
      })
      .afterClosed()
      .pipe(
        filter((ok) => ok === true),
        switchMap(() => this.api.remove(b.id)),
      )
      .subscribe({
        next: () => {
          this.notify.ok('Build eliminada');
          this.router.navigate(['/builds']);
        },
        error: (err) => this.notify.error(apiErrorMessage(err, 'No se pudo eliminar la build')),
      });
  }
}
