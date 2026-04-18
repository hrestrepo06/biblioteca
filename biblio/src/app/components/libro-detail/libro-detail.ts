import { Component, effect, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Libros } from '../../services/libros';
import { AuthService } from '../../services/auth';
import { PrestamoForm } from '../prestamo-form/prestamo-form';

@Component({
  selector: 'app-libro-detail',
  imports: [RouterLink, CommonModule, PrestamoForm],
  templateUrl: './libro-detail.html',
  styleUrl: './libro-detail.css',
})
export class LibroDetail {
  private libroService = inject(Libros);
  private authService = inject(AuthService);
  
  currentUser = this.authService.currentUser;
  // Parametro :id inyectado por el Router gracias a withComponentInputBinding
  id = input<string>();
  
  libro = this.libroService.selectedLibro;
  loading = this.libroService.loading;
  error = this.libroService.error;
  imageBaseUrl = this.libroService.imageBaseUrl;

  // Estado para el giro 3D
  volteado = signal(false);

  toggleVolteo() {
    this.volteado.update(v => !v);
  }

  // Control del modal de préstamos
  mostrarModalPrestamo = signal(false);
  
  abrirPrestamo() {
    this.mostrarModalPrestamo.set(true);
  }

  cerrarPrestamo() {
    this.mostrarModalPrestamo.set(false);
  }

  onPrestamoExitoso() {
    this.cerrarPrestamo();
    const currentId = this.id();
    if (currentId) {
      this.libroService.obtenerLibroPorId(currentId); // Recargar para ver el cambio de disponibilidad
    }
  }
  
  constructor() {
    // Escuchar cambios en la URL (ID) y setear la variable de búsqueda en el servicio
    effect(() => {
      const libroId = this.id();
      if (libroId) {
        this.libroService.obtenerLibroPorId(libroId);
      }
    });
  }
}
