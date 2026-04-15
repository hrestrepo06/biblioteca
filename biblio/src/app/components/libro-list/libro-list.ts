import { Component, OnInit, inject } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Libros } from '../../services/libros';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-libro-list',
  imports: [RouterLink],
  templateUrl: './libro-list.html',
  styleUrl: './libro-list.css',
})
export class LibroList implements OnInit {
  private libroService = inject(Libros);
  private authService = inject(AuthService);
  
  libros = this.libroService.libros;
  loading = this.libroService.loading;
  error = this.libroService.error;
  
  ngOnInit() {
    this.libroService.obtenerLibros();
  }
  
  eliminarLibro(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este libro?')) {
      this.libroService.eliminarLibro(id);
    }
  }
  
  recargar() {
    this.libroService.obtenerLibros();
  }

  onLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar la sesión?')) {
      this.authService.logout();
    }
  }
}
