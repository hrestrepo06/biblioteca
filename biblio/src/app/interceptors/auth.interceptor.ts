import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
//import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * authInterceptor — intercepta TODAS las peticiones HTTP salientes.
 *
 * Con Cookies HttpOnly, el token viaja automáticamente en la cookie.
 * Sólo necesitamos asegurarnos de:
 *   1. Enviar withCredentials: true en cada petición (para que el navegador incluya las cookies).
 *   2. Manejar el 401 (token expirado/inválido) redirigiendo al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //const router = inject(Router);
  const authService = inject(AuthService);

  // Clona la petición y agrega withCredentials para el envío automático de la cookie
  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Solo limpiamos el estado. La redirección la manejarán los Guards.
        authService.isAuthenticated.set(false);
        authService.currentUser.set(null);
      }
      return throwError(() => error);
    })
  );
};
