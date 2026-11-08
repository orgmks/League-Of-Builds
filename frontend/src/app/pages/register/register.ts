import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ChampionsService } from '../../core/services/champions.service';
import { NotifyService } from '../../core/services/notify.service';
import { apiErrorMessage } from '../../core/utils/api-error';

function mismaClave(group: AbstractControl): ValidationErrors | null {
  const a = group.get('password')?.value;
  const b = group.get('confirm')?.value;
  return a && b && a !== b ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.html',
  styleUrl: '../auth-shared.scss',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);
  protected readonly splash = `url(${inject(ChampionsService).splashUrl('Jinx')})`;

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup(
    {
      username: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9_]+$/)],
      }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8), Validators.maxLength(64)],
      }),
      confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: mismaClave },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.auth.register(username, email, password).subscribe({
      next: (user) => {
        this.notify.ok(`Cuenta creada, bienvenido ${user.username}`);
        this.router.navigateByUrl('/inicio');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(apiErrorMessage(err, 'No se pudo crear la cuenta'));
      },
    });
  }
}
