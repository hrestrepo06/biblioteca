import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { UsuariosService } from '../../services/usuarios';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TitleCasePipe],
  templateUrl: './usuario-list.html',
})
export class UsuarioList implements OnInit {
  private usuariosService = inject(UsuariosService);

  usuarios = this.usuariosService.usuarios;
  loading = this.usuariosService.loading;
  error = this.usuariosService.error;

  ngOnInit() {
    this.usuariosService.obtenerUsuarios();
  }

  recargar() {
    this.usuariosService.obtenerUsuarios();
  }

  async eliminar(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await this.usuariosService.eliminarUsuario(id);
      } catch (err) {
        // El error ya se maneja en el signal del servicio
      }
    }
  }

  getRolClass(rol: string): string {
    const base = 'px-3 py-1 rounded-full text-xs font-bold border ';
    switch (rol) {
      case 'admin':
        return base + 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'bibliotecario':
        return base + 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return base + 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  }
}
