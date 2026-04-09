import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: '',
    redirectTo: '/libros',
    pathMatch: 'full'
  },
  {
    path: 'libros',
    loadComponent: () => import('./components/libro-list/libro-list').then(m => m.LibroList)
  },
  {
    path: 'libros/crear',
    loadComponent: () => import('./components/libro-form/libro-form').then(m => m.LibroForm)
  },
  {
    path: 'libros/editar/:id',
    loadComponent: () => import('./components/libro-form/libro-form').then(m => m.LibroForm)
  },
  {
    path: 'libros/detalle/:id',
    loadComponent: () => import('./components/libro-detail/libro-detail').then(m => m.LibroDetail)
  },
  {
    path: '**',
    redirectTo: '/libros'
  }
];
