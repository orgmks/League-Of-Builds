import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { BuildCard } from '../../components/build-card/build-card';
import { BuildFormDialog } from '../../components/build-form-dialog/build-form-dialog';
import { EmptyState } from '../../components/empty-state/empty-state';
import { Loading } from '../../components/loading/loading';
import { Build, BuildFilters, BuildScope, ROLES } from '../../core/models';
import { BuildsService } from '../../core/services/builds.service';
import { NotifyService } from '../../core/services/notify.service';
import { apiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-builds',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    BuildCard,
    EmptyState,
    Loading,
  ],
  templateUrl: './builds.html',
  styleUrl: './builds.scss',
})
export class Builds {
  private readonly api = inject(BuildsService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);

  // parámetros que llegan por la URL (?championId=3&search=ahri)
  readonly championId = input<string>();
  readonly searchParam = input<string | undefined>(undefined, { alias: 'search' });

  protected readonly roles = ROLES;
  protected readonly searchCtrl = new FormControl('', { nonNullable: true });
  protected readonly roleCtrl = new FormControl('', { nonNullable: true });
  protected readonly scopeCtrl = new FormControl<BuildScope>('all', { nonNullable: true });

  private readonly search = toSignal(this.searchCtrl.valueChanges.pipe(debounceTime(300)), { initialValue: '' });
  private readonly role = toSignal(this.roleCtrl.valueChanges, { initialValue: '' });
  private readonly scope = toSignal(this.scopeCtrl.valueChanges, { initialValue: 'all' as BuildScope });

  protected readonly filters = computed<BuildFilters>(() => ({
    search: this.search(),
    role: this.role(),
    scope: this.scope(),
    championId: this.championId() ? Number(this.championId()) : null,
  }));

  protected readonly builds = this.api.listResource(this.filters);

  protected readonly hasFilters = computed(() => {
    const f = this.filters();
    return !!(f.search || f.role || f.championId || f.scope !== 'all');
  });

  protected readonly championName = computed(() => this.builds.value()[0]?.champion.name ?? 'campeón seleccionado');

  constructor() {
    effect(() => {
      const q = this.searchParam();
      if (q !== undefined) this.searchCtrl.setValue(q);
    });
  }

  clearChampion(): void {
    this.router.navigate([], { queryParams: { championId: null }, queryParamsHandling: 'merge' });
  }

  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.roleCtrl.setValue('');
    this.scopeCtrl.setValue('all');
    this.router.navigate([], { queryParams: { championId: null, search: null }, queryParamsHandling: 'merge' });
  }

  newBuild(): void {
    this.dialog
      .open(BuildFormDialog, {
        data: { championId: this.filters().championId ?? undefined },
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((saved?: Build) => {
        if (saved) this.builds.reload();
      });
  }

  toggleFavorite(b: Build): void {
    this.api.setFavorite(b.id, !b.is_favorite).subscribe({
      next: () => {
        this.notify.ok(b.is_favorite ? 'Quitada de favoritas' : 'Agregada a favoritas');
        this.builds.reload();
      },
      error: (err) => this.notify.error(apiErrorMessage(err)),
    });
  }
}
