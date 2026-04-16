import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ─── Signal reactivo del estado de autenticación ───────────────────────────
  public isAuthenticated = signal<boolean>(false);
  public currentUser = signal<AuthUser | null>(null);

  private readonly API_URL = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Envía credenciales al backend.
   * El backend responde con Set-Cookie (HttpOnly) que contiene el JWT.
   * withCredentials: true es OBLIGATORIO para que el navegador acepte la cookie.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.isAuthenticated.set(true);
          this.currentUser.set(response.user);
        })
      );
  }

  /**
   * Verifica si el token JWT en la cookie sigue siendo válido.
   * Se llama al iniciar la app para restaurar la sesión automáticamente.
   */
  checkAuth(): Observable<AuthResponse | null> {
    return this.http
      .get<AuthResponse>(`${this.API_URL}/verify`, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.isAuthenticated.set(true);
          this.currentUser.set(response.user);
        }),
        catchError(() => {
          this.isAuthenticated.set(false);
          this.currentUser.set(null);
          return of(null);
        })
      );
  }

  /**
   * Cierra la sesión. El backend elimina la cookie HttpOnly.
   */
  logout(): void {
    this.http
      .post(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          this.isAuthenticated.set(false);
          this.currentUser.set(null);
          this.router.navigate(['/login']);
        },
        error: () => {
          // Aunque falle el backend, limpiamos el estado local
          this.isAuthenticated.set(false);
          this.currentUser.set(null);
          this.router.navigate(['/login']);
        },
      });
  }

  /**
   * Verifica si el usuario actual tiene alguno de los roles permitidos.
   */
  hasRole(allowedRoles: string[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return allowedRoles.includes(user.rol);
  }
}
