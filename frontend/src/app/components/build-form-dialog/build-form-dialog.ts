import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { Build, BuildPayload, Champion, ROLES, Role } from '../../core/models';
import { BuildsService } from '../../core/services/builds.service';
import { ChampionsService } from '../../core/services/champions.service';
import { NotifyService } from '../../core/services/notify.service';
import { apiErrorMessage } from '../../core/utils/api-error';

export interface BuildFormData {
  build?: Build;
  championId?: number;
}

/** Valida formato de parche tipo 14.24 */
function patchValido(c: AbstractControl): ValidationErrors | null {
  return /^\d{1,2}\.\d{1,2}$/.test(c.value ?? '') ? null : { patch: true };
}

@Component({
  selector: 'app-build-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './build-form-dialog.html',
  styleUrl: './build-form-dialog.scss',
})
export class BuildFormDialog {
  private readonly data = inject<BuildFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<BuildFormDialog, Build>);
  private readonly buildsApi = inject(BuildsService);
  private readonly notify = inject(NotifyService);

  protected readonly champions = inject(ChampionsService).listResource(() => ({ search: '', role: '' }));
  protected readonly roles = ROLES;
  protected readonly saving = signal(false);
  protected readonly editing = computed(() => !!this.data.build);

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(60)],
    }),
    champion_id: new FormControl<number | null>(null, Validators.required),
    role: new FormControl<Role | null>(null, Validators.required),
    items: new FormArray<FormControl<string>>([]),
    runes: new FormControl('', { nonNullable: true, validators: Validators.maxLength(80) }),
    difficulty: new FormControl(3, { nonNullable: true }),
    patch: new FormControl('', { nonNullable: true, validators: [Validators.required, patchValido] }),
    description: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
  });

  constructor() {
    const b = this.data.build;
    if (b) {
      this.form.patchValue({
        title: b.title,
        champion_id: b.champion.id,
        role: b.role,
        runes: b.runes,
        difficulty: b.difficulty,
        patch: b.patch,
        description: b.description,
      });
      b.items.forEach((i) => this.addItem(i));
    } else {
      this.form.patchValue({ champion_id: this.data.championId ?? null });
      this.addItem();
    }
  }

  get items(): FormArray<FormControl<string>> {
    return this.form.controls.items;
  }

  addItem(valor = ''): void {
    if (this.items.length >= 6) return;
    this.items.push(new FormControl(valor, { nonNullable: true, validators: [Validators.required, Validators.maxLength(40)] }));
  }

  removeItem(i: number): void {
    if (this.items.length > 1) this.items.removeAt(i);
  }

  /** Al elegir campeón se sugiere su rol principal */
  onChampionChange(c: Champion | undefined): void {
    if (c && !this.form.controls.role.dirty) {
      this.form.controls.role.setValue(c.role);
    }
  }

  championById(id: number | null): Champion | undefined {
    return this.champions.value().find((c) => c.id === id);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: BuildPayload = {
      title: v.title,
      description: v.description,
      champion_id: v.champion_id!,
      role: v.role!,
      items: v.items,
      runes: v.runes,
      difficulty: v.difficulty,
      patch: v.patch,
    };

    this.saving.set(true);
    const peticion = this.data.build
      ? this.buildsApi.update(this.data.build.id, payload)
      : this.buildsApi.create(payload);

    peticion.subscribe({
      next: (saved) => {
        this.notify.ok(this.data.build ? 'Build actualizada' : 'Build creada');
        this.ref.close(saved);
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(apiErrorMessage(err, 'No se pudo guardar la build'));
      },
    });
  }
}
