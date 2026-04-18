// models/libro.model.ts
export interface Libro {
  _id?: string;
  titulo: string;
  autor: string;
  aPublicacion: string;
  editorial: string;
  categoria: string;
  sede: string;
  disponible?: boolean;
  portadaUrl?: string;
  contraportadaUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LibroCreate extends Omit<Libro, '_id'> {}