import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard';
import { AuthService } from '../../services/auth';
import { Libros } from '../../services/libros';

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

  currentUser = this.authService.currentUser;
  imageBaseUrl = this.librosService.imageBaseUrl;

  rol = this.dashboardService.rol;
  stats = this.dashboardService.stats;
  actividad = this.dashboardService.actividad;
  vencenHoy = this.dashboardService.vencenHoy;
  atrasados = this.dashboardService.atrasados;
  misPrestamos = this.dashboardService.misPrestamos;
  hasAlerts = this.dashboardService.hasAlerts;
  loading = this.dashboardService.loading;
  error = this.dashboardService.error;

  recargar() {
    this.dashboardService.recargar();
  }

  onLogout() {
    if (confirm('¿Estás seguro de cerrar la sesión?')) {
      this.authService.logout();
    }
  }
}
