import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { BuildFormDialog } from '../../components/build-form-dialog/build-form-dialog';
import { ChampionAvatar } from '../../components/champion-avatar/champion-avatar';
import { EmptyState } from '../../components/empty-state/empty-state';
import { Loading } from '../../components/loading/loading';
import { Build, Champion, ROLES } from '../../core/models';
import { ChampionsService } from '../../core/services/champions.service';

@Component({
  selector: 'app-champions',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ChampionAvatar,
    EmptyState,
    Loading,
  ],
  templateUrl: './champions.html',
  styleUrl: './champions.scss',
})
export class Champions {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly api = inject(ChampionsService);

  protected readonly roles = ROLES;
  protected readonly searchCtrl = new FormControl('', { nonNullable: true });
  protected readonly roleCtrl = new FormControl('', { nonNullable: true });

  private readonly search = toSignal(this.searchCtrl.valueChanges.pipe(debounceTime(250)), { initialValue: '' });
  private readonly role = toSignal(this.roleCtrl.valueChanges, { initialValue: '' });

  protected readonly champions = this.api.listResource(() => ({ search: this.search(), role: this.role() }));

  clear(): void {
    this.searchCtrl.setValue('');
    this.roleCtrl.setValue('');
  }

  createFor(c: Champion): void {
    this.dialog
      .open(BuildFormDialog, { data: { championId: c.id }, maxWidth: '95vw' })
      .afterClosed()
      .subscribe((saved?: Build) => {
        if (saved) this.router.navigate(['/builds', saved.id]);
      });
  }
}
