import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Libros } from '../../services/libros';
import { AuthService } from '../../services/auth';
import { PrestamoForm } from '../prestamo-form/prestamo-form';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-libro-list',
  imports: [RouterLink, CommonModule, PrestamoForm, FormsModule],
  templateUrl: './libro-list.html',
  styleUrl: './libro-list.css',
})
export class LibroList implements OnInit {
  private libroService = inject(Libros);
  private authService = inject(AuthService);
  
  libros = this.libroService.libros;
  loading = this.libroService.loading;
  error = this.libroService.error;
  currentUser = this.authService.currentUser;
  imageBaseUrl = this.libroService.imageBaseUrl;

  // Lógica de búsqueda y filtrado
  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);

  // Extraer categorías únicas de la lista de libros
  categories = computed(() => {
    const allCats = this.libros().map(l => l.categoria || 'Sin Categoría');
    return ['Todas', ...new Set(allCats)];
  });

  // El motor de filtrado principal
  filteredLibros = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const cat = this.selectedCategory();
    
    return this.libros().filter(libro => {
      const matchSearch = term === '' || 
        libro.titulo.toLowerCase().includes(term) || 
        libro.autor.toLowerCase().includes(term);
      
      const matchCat = !cat || cat === 'Todas' || libro.categoria === cat;
      
      return matchSearch && matchCat;
    });
  });

  // Control del modal de préstamos
  mostrarModalPrestamo = signal(false);
  libroSeleccionadoId = signal<string | undefined>(undefined);
  
  abrirPrestamo(id: string) {
    this.libroSeleccionadoId.set(id);
    this.mostrarModalPrestamo.set(true);
  }

  cerrarPrestamo() {
    this.mostrarModalPrestamo.set(false);
    this.libroSeleccionadoId.set(undefined);
  }

  onPrestamoExitoso() {
    this.cerrarPrestamo();
    this.libroService.obtenerLibros(); // Recargar para ver el cambio de disponibilidad
  }
  
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
