import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · LoL Hub',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · LoL Hub',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Inicio · LoL Hub',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'campeones',
        title: 'Campeones · LoL Hub',
        loadComponent: () => import('./pages/champions/champions').then((m) => m.Champions),
      },
      {
        path: 'builds',
        title: 'Builds · LoL Hub',
        loadComponent: () => import('./pages/builds/builds').then((m) => m.Builds),
      },
      {
        path: 'builds/:id',
        title: 'Detalle de build · LoL Hub',
        loadComponent: () => import('./pages/build-detail/build-detail').then((m) => m.BuildDetail),
      },
    ],
  },
  {
    path: '**',
    title: 'No encontrado · LoL Hub',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
