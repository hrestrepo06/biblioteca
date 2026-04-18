import { Injectable, signal, computed, inject } from '@angular/core';
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

  // -- Lecturas Reactivas (httpResource) --
  // Obtiene los libros automáticamente
  librosResource = httpResource(() => this.apiUrl, {
    parse: (resp: any) => resp.libros as Libro[]
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
  public libros = computed(() => this.librosResource.value() ?? []);
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

  // ------------------------------------------
  // Métodos Públicos
  // ------------------------------------------

  obtenerLibros(): void {
    // Al usar httpResource esto es redundante porque hace fetch al cargar, 
    // pero lo dejamos disponible para recargar manual si los componentes lo requieren.
    this.librosResource.reload();
  }
  
  async crearLibro(libro: LibroCreate): Promise<void> {
    this.loadingMutation.set(true);
    this.errorMutation.set(null);
    
    try {
      const response = await firstValueFrom(
        this.http.post<{success: boolean, libro: Libro}>(this.apiUrl, libro)
      );
      this.librosResource.update(libros => [...(libros ?? []), response.libro]);
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
      this.librosResource.update(libros =>
        (libros ?? []).map(lib => lib._id === id ? response.libro : lib)
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
      this.librosResource.update(libros => (libros ?? []).filter(lib => lib._id !== id));
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