import { Injectable, inject, signal } from '@angular/core';
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

  // Recurso reactivo para la lista de préstamos
  private prestamosResource = httpResource<{ ok: boolean, prestamos: Prestamo[] }>(
    () => this.apiUrl
  );

  // Signals expuestos
  prestamos = signal<Prestamo[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    // Sincronizar el signal con el recurso
    const effect = () => {
        const val = this.prestamosResource.value();
        if (val?.ok) this.prestamos.set(val.prestamos);
        this.loading.set(this.prestamosResource.isLoading());
        if (this.prestamosResource.error()) this.error.set('Error al cargar préstamos');
    };
  }

  async obtenerPrestamos() {
    this.prestamosResource.reload();
  }

  async crearPrestamo(data: PrestamoCreate) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(
        this.http.post<{ ok: boolean, prestamo: Prestamo }>(this.apiUrl, data, { withCredentials: true })
      );
      if (response.ok) {
        this.prestamos.update(prev => [response.prestamo, ...prev]);
        return response.prestamo;
      }
      throw new Error('Error al crear el préstamo');
    } catch (err: any) {
      const msg = err.error?.msg || 'Error al conectar con el servidor';
      this.error.set(msg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async devolverLibro(id: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(
        this.http.put<{ ok: boolean }>(`${this.apiUrl}/devolver/${id}`, {}, { withCredentials: true })
      );
      if (response.ok) {
        // Actualizar localmente el estado sin recargar todo
        this.prestamos.update(prev => 
          prev.map(p => p.id === id ? { ...p, estado: 'devuelto', fechaDevolucionReal: new Date().toISOString() } : p)
        );
      }
    } catch (err: any) {
      this.error.set(err.error?.msg || 'Error al procesar la devolución');
    } finally {
      this.loading.set(false);
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
}
