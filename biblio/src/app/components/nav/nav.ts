import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  public authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  onLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar la sesión?')) {
      this.authService.logout();
    }
  }
}
