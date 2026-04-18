import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth-guard';

export const routes: Routes = [
  // ── Ruta pública: Landing Page de Impacto ─────────────────────────
  {
    path: '',
    loadComponent: () => import('./components/landing/landing').then(m => m.Landing),
    canActivate: [guestGuard],
    pathMatch: 'full'
  },

  // ── Ruta pública: Login ──────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login),
    canActivate: [guestGuard]  // Si ya está logueado → redirige a /dashboard
  },

  // ── Rutas protegidas: requieren JWT válido ───────────────────────
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'libros',
    loadComponent: () => import('./components/libro-list/libro-list').then(m => m.LibroList),
    canActivate: [authGuard]
  },
  {
    path: 'libros/crear',
    loadComponent: () => import('./components/libro-form/libro-form').then(m => m.LibroForm),
    canActivate: [authGuard],
    data: { roles: ['bibliotecario', 'admin'] }
  },
  {
    path: 'libros/editar/:id',
    loadComponent: () => import('./components/libro-form/libro-form').then(m => m.LibroForm),
    canActivate: [authGuard],
    data: { roles: ['bibliotecario', 'admin'] }
  },
  {
    path: 'libros/detalle/:id',
    loadComponent: () => import('./components/libro-detail/libro-detail').then(m => m.LibroDetail),
    canActivate: [authGuard]
  },

  // RUTA DE GESTIÓN DE USUARIOS (Solo Admin)
  {
    path: 'usuarios',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    children: [
      { 
        path: '', 
        loadComponent: () => import('./components/usuario-list/usuario-list').then(m => m.UsuarioList), 
        title: 'Gestión de Usuarios - Biblioteca' 
      },
      { 
        path: 'crear', 
        loadComponent: () => import('./components/usuario-form/usuario-form').then(m => m.UsuarioForm), 
        title: 'Nuevo Usuario - Biblioteca' 
      },
      { 
        path: 'editar/:id', 
        loadComponent: () => import('./components/usuario-form/usuario-form').then(m => m.UsuarioForm), 
        title: 'Editar Usuario - Biblioteca' 
      },
      { 
        path: 'detalle/:id', 
        loadComponent: () => import('./components/usuario-detail/usuario-detail').then(m => m.UsuarioDetail), 
        title: 'Detalle de Usuario - Biblioteca' 
      },
    ]
  },

  // RUTA DE PRÉSTAMOS (Admin y Bibliotecario)
  {
    path: 'prestamos',
    canActivate: [authGuard],
    data: { roles: ['bibliotecario', 'admin'] },
    children: [
      { 
        path: '', 
        loadComponent: () => import('./components/prestamo-list/prestamo-list').then(m => m.PrestamoList), 
        title: 'Gestión de Préstamos - Biblioteca' 
      }
    ]
  },

  // ── Wildcard ─────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
