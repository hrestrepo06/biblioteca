import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard';
import { AuthService } from '../../services/auth';
import { Libros } from '../../services/libros';
import { PrestamosService } from '../../services/prestamos';
import { AuditoriaService } from '../../services/auditoria';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private librosService = inject(Libros);
  private prestamosService = inject(PrestamosService);
  public auditoriaService = inject(AuditoriaService);

  currentUser = this.authService.currentUser;
  imageBaseUrl = this.librosService.imageBaseUrl;

  solicitudesPendientes = signal<any[]>([]);

  rol = this.dashboardService.rol;
  stats = this.dashboardService.stats;
  actividad = this.dashboardService.actividad;
  vencenHoy = this.dashboardService.vencenHoy;
  atrasados = this.dashboardService.atrasados;
  misPrestamos = this.dashboardService.misPrestamos;
  hasAlerts = this.dashboardService.hasAlerts;
  loading = this.dashboardService.loading;
  error = this.dashboardService.error;

  // Libro Mayor
  auditoriaRegistros = this.auditoriaService.registros;
  auditoriaLoading = this.auditoriaService.loading;
  auditoriaTotal = this.auditoriaService.total;

  constructor() {
    effect(() => {
      if (this.rol() === 'admin_biblio' && !this.loading()) {
        this.cargarPendientes();
      }
    });
  }

  async cargarPendientes() {
    const reservas = await this.prestamosService.obtenerPendientes();
    this.solicitudesPendientes.set(reservas);
  }

  async aprobarReserva(id: string) {
    try {
      await this.prestamosService.aprobarReserva(id);
      this.cargarPendientes();
      this.recargar();
    } catch (err: any) {
      alert(err?.error?.msg || 'Error al aprobar');
    }
  }

  async rechazarReserva(id: string) {
    if (confirm('¿Seguro que deseas rechazar esta solicitud? El libro volverá al catálogo.')) {
      try {
        await this.prestamosService.rechazarReserva(id);
        this.cargarPendientes();
      } catch (err: any) {
        alert(err?.error?.msg || 'Error al rechazar');
      }
    }
  }

  recargar() {
    this.dashboardService.recargar();
    if (this.rol() === 'admin_biblio') {
      this.cargarPendientes();
      this.auditoriaService.recargar();
    }
  }

  accionBadgeClass(accion: string): string {
    const map: Record<string, string> = {
      'LOGIN': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'CREAR_LIBRO': 'bg-green-500/10 text-green-400 border-green-500/20',
      'EDITAR_LIBRO': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'ELIMINAR_LIBRO': 'bg-red-500/10 text-red-400 border-red-500/20',
      'CREAR_PRESTAMO': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'DEVOLVER_LIBRO': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      'SOLICITAR_RESERVA': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'APROBAR_RESERVA': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'RECHAZAR_RESERVA': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'ELIMINAR_USUARIO': 'bg-red-900/20 text-red-300 border-red-700/30',
    };
    return `px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${map[accion] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`;
  }

  onLogout() {
    if (confirm('¿Estás seguro de cerrar la sesión?')) {
      this.authService.logout();
    }
  }
}
