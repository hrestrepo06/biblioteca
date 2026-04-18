import { Libro } from './libro.model';
import { Usuario } from './usuario.model';

export interface Prestamo {
  id: string;
  libro: Partial<Libro>;
  usuario: Partial<Usuario>;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  fechaDevolucionReal?: string;
  estado: 'activo' | 'devuelto' | 'atrasado';
  createdAt?: string;
  updatedAt?: string;
}

export interface PrestamoCreate {
  libroId: string;
  usuarioId: string;
}
