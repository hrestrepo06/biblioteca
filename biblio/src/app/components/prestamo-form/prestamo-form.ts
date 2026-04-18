import { Component, OnInit, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamosService } from '../../services/prestamos';
import { UsuariosService } from '../../services/usuarios';
import { Libros } from '../../services/libros';

@Component({
  selector: 'app-prestamo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prestamo-form.html',
})
export class PrestamoForm implements OnInit {
  private prestamosService = inject(PrestamosService);
  private usuariosService = inject(UsuariosService);
  private librosService = inject(Libros);

  // Inputs para recibir el libro si se abre desde el catálogo
  libroId = input<string>();
  
  // Outputs para cerrar el modal o avisar éxito
  close = output<void>();
  success = output<void>();

  selectedUsuarioId = signal<string>('');
  usuarios = this.usuariosService.usuarios;
  loading = signal(false);
  errorStr = signal<string | null>(null);

  ngOnInit() {
    this.usuariosService.obtenerUsuarios();
  }

  async registrar() {
    const lId = this.libroId();
    const uId = this.selectedUsuarioId();

    if (!lId || !uId) {
      this.errorStr.set('Selecciona un usuario válido');
      return;
    }

    this.loading.set(true);
    this.errorStr.set(null);

    try {
      await this.prestamosService.crearPrestamo({
        libroId: lId,
        usuarioId: uId
      });
      this.success.emit();
    } catch (err: any) {
      this.errorStr.set(err.error?.msg || 'Error al registrar préstamo');
    } finally {
      this.loading.set(false);
    }
  }

  cancelar() {
    this.close.emit();
  }
}
