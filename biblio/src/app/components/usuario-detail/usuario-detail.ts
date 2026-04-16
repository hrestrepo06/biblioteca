import { Component, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { UsuariosService } from '../../services/usuarios';

@Component({
  selector: 'app-usuario-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, TitleCasePipe],
  templateUrl: './usuario-detail.html',
})
export class UsuarioDetail {
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  
  // ID capturado de la ruta (detalle/:id)
  id = input<string>();
  
  usuario = this.usuariosService.selectedUsuario;
  loading = this.usuariosService.loading;
  error = this.usuariosService.error;

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
