export interface Usuario {
  id: string; // Devuelto por el transformador toJSON del backend
  nombre: string;
  email: string;
  rol: 'admin' | 'bibliotecario' | 'lector';
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsuarioCreate {
  nombre: string;
  email: string;
  password?: string;
  rol: 'admin' | 'bibliotecario' | 'lector';
  activo?: boolean;
}

export interface UsuarioUpdate {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: 'admin' | 'bibliotecario' | 'lector';
  activo?: boolean;
}
