import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Libros } from '../../services/libros';
import { AuthService } from '../../services/auth';
import { PrestamosService } from '../../services/prestamos';
import { PrestamoForm } from '../prestamo-form/prestamo-form';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-libro-list',
  imports: [RouterLink, CommonModule, PrestamoForm, FormsModule],
  templateUrl: './libro-list.html',
  styleUrl: './libro-list.css',
})
export class LibroList implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollAncla') scrollAncla!: ElementRef;

  private libroService = inject(Libros);
  private authService = inject(AuthService);
  private prestamosService = inject(PrestamosService);

  private observer: IntersectionObserver | null = null;

  libros = this.libroService.libros;
  loading = this.libroService.loading;
  error = this.libroService.error;
  hasMore = this.libroService.hasMore;
  currentUser = this.authService.currentUser;
  imageBaseUrl = this.libroService.imageBaseUrl;

  // Búsqueda local (debounced toward backend)
  searchTerm = signal('');
  selectedCategory = signal('Todas');

  // Categorías derivadas de los libros cargados (+ estáticas)
  categories = computed(() => {
    const allCats = this.libros().map(l => l.categoria || 'Sin Categoría');
    return ['Todas', ...new Set(allCats)];
  });

  // Control del modal de préstamos
  mostrarModalPrestamo = signal(false);
  libroSeleccionadoId = signal<string | undefined>(undefined);

  private searchTimeout: any;

  constructor() {
    // Reaccionar a cambios de búsqueda con debounce de 400ms
    effect(() => {
      const term = this.searchTerm();
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.libroService.aplicarFiltros(term, this.selectedCategory());
      }, 400);
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Carga inicial: page 1, sin filtros
    this.libroService.aplicarFiltros('', 'Todas');
  }

  ngAfterViewInit() {
    // Configurar el IntersectionObserver sobre el ancla invisible al final del catálogo
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && this.hasMore() && !this.loading()) {
          this.libroService.nextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (this.scrollAncla?.nativeElement) {
      this.observer.observe(this.scrollAncla.nativeElement);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  onCategoryChange(cat: string) {
    this.selectedCategory.set(cat);
    this.libroService.aplicarFiltros(this.searchTerm(), cat);
  }

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
    this.libroService.obtenerLibros();
  }

  eliminarLibro(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este libro?')) {
      this.libroService.eliminarLibro(id);
    }
  }

  recargar() {
    this.libroService.aplicarFiltros(this.searchTerm(), this.selectedCategory());
  }

  async solicitarReserva(libroId: string) {
    if (confirm('¿Deseas solicitar este libro para reserva? El estado pasará a pendiente.')) {
      try {
        const respuesta = await this.prestamosService.solicitarReserva(libroId);
        alert(respuesta.msg || 'Solicitud de reserva enviada.');
        this.recargar();
      } catch (err: any) {
        alert(err.error?.msg || 'Error al solicitar.');
      }
    }
  }

  onLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar la sesión?')) {
      this.authService.logout();
    }
  }
}
