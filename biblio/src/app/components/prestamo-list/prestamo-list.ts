import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PrestamosService } from '../../services/prestamos';

@Component({
  selector: 'app-prestamo-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './prestamo-list.html',
})
export class PrestamoList implements OnInit {
  private prestamosService = inject(PrestamosService);

  prestamos = this.prestamosService.prestamos;
  loading = this.prestamosService.loading;
  error = this.prestamosService.error;

  ngOnInit() {
    this.prestamosService.obtenerPrestamos();
  }

  async devolver(id: string) {
    if (confirm('¿Confirmar devolución de este libro?')) {
      await this.prestamosService.devolverLibro(id);
    }
  }

  getEstadoClass(estado: string): string {
    const base = 'px-2 py-1 rounded-md text-xs font-bold ';
    switch (estado) {
      case 'activo': return base + 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'devuelto': return base + 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'atrasado': return base + 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return base + 'bg-gray-500/10 text-gray-400';
    }
  }
}
