import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

export interface DashboardStats {
  totalLibros: number;
  prestamosActivos: number;
  totalDisponibles: number;
  prestamosAtrasados: number;
  totalUsuarios: number;
}

export interface ActivityItem {
  _id: string;
  libro: {
    titulo: string;
    portadaUrl?: string;
  };
  usuario: {
    nombre: string;
    email: string;
  };
  createdAt: string;
  fechaDevolucionEsperada?: string;
}

export interface DashboardResponse {
  success: boolean;
  rol: string;
  stats?: DashboardStats;
  vencenHoy?: any[];
  atrasadosDetalle?: any[];
  actividadReciente: ActivityItem[];
  misPrestamos?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard/stats`;

  // Recurso reactivo para las estadísticas con credenciales de seguridad
  statsResource = httpResource(() => ({
    url: this.apiUrl,
    withCredentials: true
  }), {
    parse: (resp: any) => resp as DashboardResponse
  });

  // Signals computados para facilitar el acceso según el rol
  public rol = computed(() => this.statsResource.value()?.rol);
  public stats = computed(() => this.statsResource.value()?.stats);
  public actividad = computed(() => this.statsResource.value()?.actividadReciente ?? []);
  public vencenHoy = computed(() => this.statsResource.value()?.vencenHoy ?? []);
  public atrasados = computed(() => this.statsResource.value()?.atrasadosDetalle ?? []);
  public misPrestamos = computed(() => this.statsResource.value()?.misPrestamos ?? []);
  
  public hasAlerts = computed(() => 
    (this.vencenHoy().length > 0) || (this.atrasados().length > 0)
  );

  public loading = computed(() => this.statsResource.isLoading());
  public error = computed(() => this.statsResource.error() ? 'Error al cargar estadísticas' : null);

  recargar() {
    this.statsResource.reload();
  }
}
