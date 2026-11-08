import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models';

const TOKEN_KEY = 'lolhub_token';
const USER_KEY = 'lolhub_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = `${environment.apiUrl}/auth`;

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _user = signal<User | null>(this.leerUsuario());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token() && !!this._user());

  token(): string | null {
    return this._token();
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap((r) => this.guardarSesion(r)), map((r) => r.user));
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, { username, email, password })
      .pipe(tap((r) => this.guardarSesion(r)), map((r) => r.user));
  }

  logout(redirect = true): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  /** Revisa que haya token y que su fecha de expiración (claim exp) no haya pasado. */
  hasValidSession(): boolean {
    const token = this._token();
    if (!token || !this._user()) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private guardarSesion(r: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, r.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(r.user));
    this._token.set(r.access_token);
    this._user.set(r.user);
  }

  private leerUsuario(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
