import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ROUTES } from '../../constants/app.constants';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  public authService = inject(AuthService);
  private router = inject(Router);
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  isPublicPage(): boolean {
    const url = this.router.url;
    return url === ROUTES.HOME || url.startsWith(ROUTES.LOGIN);
  }

  onLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar la sesión?')) {
      this.authService.logout();
    }
  }
}
