import { Component, effect, inject, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Libros } from '../../services/libros';
//import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-libro-detail',
  imports: [RouterLink],
  templateUrl: './libro-detail.html',
  styleUrl: './libro-detail.css',
})
export class LibroDetail {
  private libroService = inject(Libros);
  
  // Parametro :id inyectado por el Router gracias a withComponentInputBinding
  id = input<string>();
  
  // En lugar de duplicar estado en un signal local, consumimos el computed directamente
  libro = this.libroService.selectedLibro;
  loading = this.libroService.loading;
  error = this.libroService.error;
  
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
