import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { Nav } from './components/nav/nav';
import { ROUTES } from './constants/app.constants';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Nav],
  template: `
    <app-nav></app-nav>
    <main [class.has-sidebar]="isAuthenticated() && !isPublicPage()" class="transition-all duration-300">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.css'
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  isPublicPage(): boolean {
    const url = this.router.url;
    // Comprueba si la URL actual coincide con el inicio de la ruta de Login o es la Home
    return url === ROUTES.HOME || url.startsWith(ROUTES.LOGIN);
  }
}
