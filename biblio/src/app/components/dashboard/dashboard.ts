import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard';
import { AuthService } from '../../services/auth';
import { Libros } from '../../services/libros';
import { PrestamosService } from '../../services/prestamos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private librosService = inject(Libros);
  private prestamosService = inject(PrestamosService);

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
    }
  }

  onLogout() {
    if (confirm('¿Estás seguro de cerrar la sesión?')) {
      this.authService.logout();
    }
  }
}
