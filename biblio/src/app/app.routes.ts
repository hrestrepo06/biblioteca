import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Redirige raíz a /libros (el guard se encarga de mandar al login si no está autenticado)
  {
    path: '',
    redirectTo: '/libros',
    pathMatch: 'full'
  },

  // ── Ruta pública: Login ──────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login),
    canActivate: [guestGuard]  // Si ya está logueado → redirige a /libros
  },

  // ── Rutas protegidas: requieren JWT válido ───────────────────────
  {
    path: 'libros',
    loadComponent: () => import('./components/libro-list/libro-list').then(m => m.LibroList),
    canActivate: [authGuard]
  },
  {
    path: 'libros/crear',
    loadComponent: () => import('./components/libro-form/libro-form').then(m => m.LibroForm),
    canActivate: [authGuard]
  },
  {
    path: 'libros/editar/:id',
    loadComponent: () => import('./components/libro-form/libro-form').then(m => m.LibroForm),
    canActivate: [authGuard]
  },
  {
    path: 'libros/detalle/:id',
    loadComponent: () => import('./components/libro-detail/libro-detail').then(m => m.LibroDetail),
    canActivate: [authGuard]
  },

  // ── Wildcard ─────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: '/libros'
  }
];
