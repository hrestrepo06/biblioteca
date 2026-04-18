import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/usuario.model';
import { environment } from '../../environments/environment.development';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  // Estado reactivo Signals
  private loadingMutation = signal<boolean>(false);
  private errorMutation = signal<string | null>(null);
  
  // Usuario seleccionado para edición/detalle
  private selectedIdSignal = signal<string | null>(null);

  // Recurso reactivo central
  private usuariosResource = httpResource<{ ok: boolean, usuarios: Usuario[], total: number }>(() => this.apiUrl);
  
  // Derivamos los datos mediante computed signals
  usuarios = computed(() => this.usuariosResource.value()?.usuarios ?? []);
  
  // Estado de carga consolidado
  loading = computed(() => 
    this.usuariosResource.isLoading() || this.loadingMutation()
  );
  
  // Estado de error consolidado
  error = computed(() => {
    const fetchError = this.usuariosResource.error();
    if (fetchError) return 'Error al conectar con la base de datos de usuarios';
    return this.errorMutation();
  });

  // Usuario seleccionado derivado sincrónicamente desde la lista en memoria
  selectedUsuario = computed(() => {
    const id = this.selectedIdSignal();
    if (!id) return null;
    return this.usuarios().find(u => u.id === id) || null;
  });

  // --- MÉTODOS CRUD ---

  obtenerUsuarios(): void {
    this.errorMutation.set(null);
    this.usuariosResource.reload();
  }

  seleccionarUsuarioPorId(id: string): void {
    this.errorMutation.set(null);
    this.selectedIdSignal.set(id);
  }

  limpiarSeleccion(): void {
    this.selectedIdSignal.set(null);
  }

  async crearUsuario(usuario: UsuarioCreate): Promise<void> {
    this.loadingMutation.set(true);
    this.errorMutation.set(null);
    
    try {
      const response = await firstValueFrom(
        this.http.post<{ ok: boolean, usuario: Usuario }>(this.apiUrl, usuario)
      );
      // Actualización optimista de la tabla local
      this.usuariosResource.update(data => {
        if (!data) return data;
        return { ...data, usuarios: [response.usuario, ...data.usuarios] };
      });
      this.loadingMutation.set(false);
    } catch (error: any) {
      this.errorMutation.set(error.error?.msg || 'Error al crear el usuario');
      this.loadingMutation.set(false);
      throw error;
    }
  }

  async actualizarUsuario(id: string, usuario: UsuarioUpdate): Promise<void> {
    this.loadingMutation.set(true);
    this.errorMutation.set(null);
    
    try {
      const response = await firstValueFrom(
        this.http.put<{ ok: boolean, usuario: Usuario }>(`${this.apiUrl}/${id}`, usuario)
      );
      // Actualizamos la fila en la tabla reactiva
      this.usuariosResource.update(data => {
        if (!data) return data;
        const updatedLista = data.usuarios.map(u => u.id === id ? response.usuario : u);
        return { ...data, usuarios: updatedLista };
      });
      this.loadingMutation.set(false);
    } catch (error: any) {
      this.errorMutation.set(error.error?.msg || 'Error al actualizar el usuario');
      this.loadingMutation.set(false);
      throw error;
    }
  }

  async eliminarUsuario(id: string): Promise<void> {
    this.loadingMutation.set(true);
    this.errorMutation.set(null);
    
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      // Removemos visualmente el usuario
      this.usuariosResource.update(data => {
        if (!data) return data;
        return { ...data, usuarios: data.usuarios.filter(u => u.id !== id) };
      });
      if (this.selectedIdSignal() === id) {
        this.selectedIdSignal.set(null);
      }
      this.loadingMutation.set(false);
    } catch (error: any) {
      this.errorMutation.set(error.error?.msg || 'Error al eliminar el usuario');
      this.loadingMutation.set(false);
      throw error;
    }
  }
}
