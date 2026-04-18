import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { UsuariosService } from '../../services/usuarios';
import { PrestamosService } from '../../services/prestamos';
import { Prestamo } from '../../models/prestamo.model';

@Component({
  selector: 'app-usuario-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './usuario-detail.html',
})
export class UsuarioDetail implements OnInit {
  private usuariosService = inject(UsuariosService);
  private prestamosService = inject(PrestamosService);
  private router = inject(Router);
  
  // ID capturado de la ruta (detalle/:id)
  id = input.required<string>();
  
  usuario = this.usuariosService.selectedUsuario;
  loading = this.usuariosService.loading;
  error = this.usuariosService.error;
  
  // Préstamos del usuario
  prestamos = signal<Prestamo[]>([]);

  async ngOnInit() {
    const userId = this.id();
    this.usuariosService.seleccionarUsuarioPorId(userId);
    
    // Cargar historial de préstamos
    const res = await this.prestamosService.obtenerPrestamosPorUsuario(userId);
    this.prestamos.set(res);
  }

  constructor() {
    effect(() => {
      const usuarioId = this.id();
      if (usuarioId) {
        this.usuariosService.seleccionarUsuarioPorId(usuarioId);
      }
    });
  }

  getRolClass(rol: string): string {
    const base = 'px-3 py-1 rounded-full border ';
    switch (rol) {
      case 'admin': return base + 'bg-purple-500/10 text-purple-400 border-purple-500/30 font-bold';
      case 'bibliotecario': return base + 'bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold';
      default: return base + 'bg-gray-500/10 text-gray-400 border-gray-500/30 font-bold';
    }
  }

  async eliminar() {
    const usuarioId = this.id();
    if (usuarioId && confirm('¿Deseas eliminar permanentemente este usuario?')) {
      try {
        await this.usuariosService.eliminarUsuario(usuarioId);
        this.router.navigate(['/usuarios']);
      } catch (err) {}
    }
  }
}
