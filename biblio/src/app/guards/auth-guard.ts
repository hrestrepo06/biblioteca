import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * AuthGuard — Protege rutas que requieren autenticación.
 * Si el usuario no está autenticado, lo redirige al login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Verificación de roles (si se definieron en la ruta)
    const allowedRoles = route.data['roles'] as string[];
    if (allowedRoles && !authService.hasRole(allowedRoles)) {
      router.navigate(['/dashboard']); // Redirigir a inicio si no tiene permisos
      return false;
    }
    return true;
  }

  // Guarda la URL a la que intentaba acceder para redirigir después del login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

/**
 * GuestGuard — Evita que un usuario ya autenticado vuelva al login.
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
