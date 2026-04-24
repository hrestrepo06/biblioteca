import { Routes } from '@angular/router';
import { Landing } from './components/landing/landing';
import { authGuard, guestGuard } from './guards/auth-guard';

export const routes: Routes = [
  // ── Ruta pública: Landing ──────────────────────────────────────────
  {
    path: '',
    component: Landing,
    canActivate: [guestGuard],
    pathMatch: 'full'
  },

  // ── Ruta pública: Login ──────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },

  // ── Rutas protegidas ──────────────────────────────────────────────
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

  // Gestión de Usuarios
  {
    path: 'usuarios',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    children: [
      { 
        path: '', 
        loadComponent: () => import('./components/usuario-list/usuario-list').then(m => m.UsuarioList)
      },
      { 
        path: 'crear', 
        loadComponent: () => import('./components/usuario-form/usuario-form').then(m => m.UsuarioForm)
      },
      { 
        path: 'editar/:id', 
        loadComponent: () => import('./components/usuario-form/usuario-form').then(m => m.UsuarioForm)
      },
      { 
        path: 'detalle/:id', 
        loadComponent: () => import('./components/usuario-detail/usuario-detail').then(m => m.UsuarioDetail)
      }
    ]
  },

  // Préstamos
  {
    path: 'prestamos',
    canActivate: [authGuard],
    data: { roles: ['bibliotecario', 'admin'] },
    children: [
      { 
        path: '', 
        loadComponent: () => import('./components/prestamo-list/prestamo-list').then(m => m.PrestamoList)
      }
    ]
  },

  // ── Comodín ──────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: ''
  }
];
