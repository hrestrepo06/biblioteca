import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Prestamo, PrestamoCreate } from '../models/prestamo.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/prestamos`;

  // Recurso reactivo para la lista de préstamos (con credenciales)
  private prestamosResource = httpResource<{ ok: boolean, prestamos: Prestamo[] }>(
    () => ({ url: this.apiUrl, withCredentials: true })
  );

  // Signals computados — siempre en sincronía con el recurso (READ-ONLY)
  prestamos = computed(() => this.prestamosResource.value()?.prestamos ?? []);
  loading   = computed(() => this.prestamosResource.isLoading() || this._loadingMutation());
  error     = computed(() => this.prestamosResource.error() ? 'Error al cargar préstamos' : this._errorMutation());

  // Signals escribibles para operaciones de mutación (reservas)
  private _loadingMutation = signal<boolean>(false);
  private _errorMutation   = signal<string | null>(null);

  async obtenerPrestamos() {
    this.prestamosResource.reload();
  }

  async crearPrestamo(data: PrestamoCreate) {
    try {
      const response = await firstValueFrom(
        this.http.post<{ ok: boolean, prestamo: Prestamo }>(this.apiUrl, data, { withCredentials: true })
      );
      if (response.ok) {
        this.prestamosResource.reload();
        return response.prestamo;
      }
      throw new Error('Error al crear el préstamo');
    } catch (err: any) {
      throw err;
    }
  }

  async devolverLibro(id: string) {
    try {
      const response = await firstValueFrom(
        this.http.put<{ ok: boolean }>(`${this.apiUrl}/devolver/${id}`, {}, { withCredentials: true })
      );
      if (response.ok) {
        this.prestamosResource.reload();
      }
    } catch (err: any) {
      throw err;
    }
  }

  async obtenerPrestamosPorUsuario(usuarioId: string) {
    try {
      const response = await firstValueFrom(
        this.http.get<{ ok: boolean, prestamos: Prestamo[] }>(`${this.apiUrl}/usuario/${usuarioId}`, { withCredentials: true })
      );
      return response.ok ? response.prestamos : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // --- SISTEMA DE RESERVAS ASÍNCRONAS ---

  async solicitarReserva(libroId: string) {
    this._loadingMutation.set(true);
    this._errorMutation.set(null);
    try {
      const response = await firstValueFrom(
        this.http.post<{ ok: boolean, msg: string }>(
          `${this.apiUrl}/solicitar`,
          { libroId },
          { withCredentials: true }
        )
      );
      return response;
    } catch (err: any) {
      this._errorMutation.set(err.error?.msg || 'Error al solicitar reserva');
      throw err;
    } finally {
      this._loadingMutation.set(false);
    }
  }

  async obtenerPendientes() {
    try {
      const response = await firstValueFrom(
        this.http.get<{ ok: boolean, solicitudes: Prestamo[] }>(
          `${this.apiUrl}/pendientes`,
          { withCredentials: true }
        )
      );
      return response.ok ? response.solicitudes : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async aprobarReserva(id: string) {
    this._loadingMutation.set(true);
    try {
      const response = await firstValueFrom(
        this.http.put<{ ok: boolean, msg: string }>(
          `${this.apiUrl}/${id}/aprobar`,
          {},
          { withCredentials: true }
        )
      );
      return response;
    } catch (err: any) {
      this._errorMutation.set(err.error?.msg || 'Error al aprobar reserva');
      throw err;
    } finally {
      this._loadingMutation.set(false);
    }
  }

  async rechazarReserva(id: string) {
    this._loadingMutation.set(true);
    try {
      const response = await firstValueFrom(
        this.http.put<{ ok: boolean, msg: string }>(
          `${this.apiUrl}/${id}/rechazar`,
          {},
          { withCredentials: true }
        )
      );
      return response;
    } catch (err: any) {
      this._errorMutation.set(err.error?.msg || 'Error al rechazar reserva');
      throw err;
    } finally {
      this._loadingMutation.set(false);
    }
  }
}
