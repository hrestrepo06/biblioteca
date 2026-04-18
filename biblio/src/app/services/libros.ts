import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Libro, LibroCreate } from '../models/libro.model';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Libros {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/libros`;
  public imageBaseUrl = environment.baseUrl; // Para acceder a /covers en la raíz
  
  // -- Estado Local para Mutaciones --
  private loadingMutation = signal<boolean>(false);
  private errorMutation = signal<string | null>(null);

  // -- Estado Local para Paginación y Filtrado --
  public queryData = signal({ page: 1, limit: 10, search: '', category: 'Todas' });
  public metaPagination = signal<{ total: number, page: number, totalPages: number, hasMore: boolean } | null>(null);
  private acumuladoLibros = signal<Libro[]>([]);

  // -- Lectura Reactiva (httpResource paramétrico) --
  librosResource = httpResource(() => {
    const { page, limit, search, category } = this.queryData();
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category && category !== 'Todas') url += `&category=${encodeURIComponent(category)}`;
    return url;
  });

  // Signal para almacenar el ID que buscamos consultar
  private selectedIdSignal = signal<string | null>(null);

  // Obtiene el libro automáticamente cada que selectedIdSignal cambie
  selectedLibroResource = httpResource(() => {
    const id = this.selectedIdSignal();
    return id ? `${this.apiUrl}/${id}` : undefined;
  }, {
    parse: (resp: any) => resp.libro as Libro
  });

  // -- API Pública Expuesta para Componentes --
  public libros = computed(() => this.acumuladoLibros());
  public selectedLibro = computed(() => this.selectedLibroResource.value() ?? null);
  public totalLibros = computed(() => this.libros().length);

  // Unificamos el estado de Carga de todo: Mutaciones + Lecturas
  public loading = computed(() => 
    this.loadingMutation() || 
    this.librosResource.isLoading() || 
    this.selectedLibroResource.isLoading()
  );

  // Unificamos el estado de Error: Mutaciones + Lecturas
  public error = computed(() => 
    this.errorMutation() || 
    (this.librosResource.error() ? 'Error al cargar libros/recurso' : null) || 
    (this.selectedLibroResource.error() ? 'Error al recurso' : null)
  );

  public hasMore = computed(() => this.metaPagination()?.hasMore ?? false);

  constructor() {
    // Sincronizar el httpResource paginado con el signal acumulador
    effect(() => {
      const val = this.librosResource.value() as any;
      if (val?.success && Array.isArray(val.libros)) {
        if (this.queryData().page === 1) {
          // Búsqueda/filtro nuevo: reemplazar todo
          this.acumuladoLibros.set(val.libros);
        } else {
          // Página siguiente: concatenar evitando duplicados
          this.acumuladoLibros.update(prev => {
            const nuevos = val.libros.filter((l: any) => !prev.some((p: any) => p._id === l._id));
            return [...prev, ...nuevos];
          });
        }
        this.metaPagination.set(val.pagination);
      }
    }, { allowSignalWrites: true });
  }

  // ------------------------------------------
  // Métodos Públicos
  // ------------------------------------------

  obtenerLibros(): void {
    this.librosResource.reload();
  }

  aplicarFiltros(search: string, category: string): void {
    // Regresamos a la página 1 para el nuevo término de búsqueda
    this.queryData.set({ page: 1, limit: 12, search, category });
  }

  nextPage(): void {
    const meta = this.metaPagination();
    if (meta && meta.hasMore && !this.loading()) {
      this.queryData.update(q => ({ ...q, page: q.page + 1 }));
    }
  }
  
  async crearLibro(libro: LibroCreate): Promise<void> {
    this.loadingMutation.set(true);
    this.errorMutation.set(null);
    
    try {
      const response = await firstValueFrom(
        this.http.post<{success: boolean, libro: Libro}>(this.apiUrl, libro)
      );
      // Para consistencia con la paginación, si el usuario crea uno forzamos reload general
      this.obtenerLibros();
      this.loadingMutation.set(false);
    } catch (error) {
      this.errorMutation.set('Error al crear el libro');
      this.loadingMutation.set(false);
      console.error('Error:', error);
      throw error;
    }
  }
  
  obtenerLibroPorId(id: string): void {
    // El cambiar esta variable detona internamente un GET fetch en selectedLibroResource
    this.selectedIdSignal.set(id);
  }
  
  async actualizarLibro(id: string, libro: Partial<Libro>): Promise<void> {
    this.loadingMutation.set(true);
    this.errorMutation.set(null);
    
    try {
      const response = await firstValueFrom(
        this.http.put<{success: boolean, libro: Libro}>(`${this.apiUrl}/${id}`, libro)
      );
      this.acumuladoLibros.update(libros =>
        libros.map(lib => lib._id === id ? response.libro : lib)
      );
      this.loadingMutation.set(false);
    } catch (error) {
      this.errorMutation.set('Error al actualizar el libro');
      this.loadingMutation.set(false);
      console.error('Error:', error);
      throw error;
    }
  }
  
  async eliminarLibro(id: string): Promise<void> {
    this.loadingMutation.set(true);
    this.errorMutation.set(null);
    
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.acumuladoLibros.update(libros => libros.filter(lib => lib._id !== id));
      if (this.selectedIdSignal() === id) {
        this.selectedIdSignal.set(null);
      }
      this.loadingMutation.set(false);
    } catch (error) {
      this.errorMutation.set('Error al eliminar el libro');
      this.loadingMutation.set(false);
      console.error('Error:', error);
      throw error;
    }
  }
  
  limpiarSeleccion(): void {
    this.selectedIdSignal.set(null);
  }
}