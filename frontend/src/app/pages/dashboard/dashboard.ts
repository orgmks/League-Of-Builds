import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { BuildCard } from '../../components/build-card/build-card';
import { BuildFormDialog } from '../../components/build-form-dialog/build-form-dialog';
import { ChampionAvatar } from '../../components/champion-avatar/champion-avatar';
import { EmptyState } from '../../components/empty-state/empty-state';
import { Loading } from '../../components/loading/loading';
import { Build } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { BuildsService } from '../../core/services/builds.service';
import { NotifyService } from '../../core/services/notify.service';
import { StatsService } from '../../core/services/stats.service';
import { apiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BuildCard,
    ChampionAvatar,
    EmptyState,
    Loading,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly dialog = inject(MatDialog);
  private readonly buildsApi = inject(BuildsService);
  private readonly notify = inject(NotifyService);

  protected readonly user = inject(AuthService).user;
  protected readonly stats = inject(StatsService).resource();
  protected readonly builds = this.buildsApi.listResource(() => ({
    search: '',
    role: '',
    scope: 'all',
    championId: null,
  }));

  protected readonly recientes = computed(() => this.builds.value().slice(0, 3));
  protected readonly maxRol = computed(() => Math.max(1, ...(this.stats.value()?.by_role.map((r) => r.total) ?? [1])));

  newBuild(): void {
    this.dialog
      .open(BuildFormDialog, { data: {}, maxWidth: '95vw' })
      .afterClosed()
      .subscribe((saved?: Build) => {
        if (saved) this.reload();
      });
  }

  toggleFavorite(b: Build): void {
    this.buildsApi.setFavorite(b.id, !b.is_favorite).subscribe({
      next: () => this.reload(),
      error: (err) => this.notify.error(apiErrorMessage(err)),
    });
  }

  reload(): void {
    this.builds.reload();
    this.stats.reload();
  }
}
