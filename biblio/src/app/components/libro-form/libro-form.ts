import { Component, effect, inject, signal, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Libros } from '../../services/libros';

@Component({
  selector: 'app-libro-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './libro-form.html',
  styleUrl: './libro-form.css',
})
export class LibroForm {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private libroService = inject(Libros);
  
  // Parametro :id autocompletado por el Router
  id = input<string>();
  
  // Formulario fuertemente tipado
  libroForm = this.fb.group({
    titulo: this.fb.control('', [Validators.required]),
    autor: this.fb.control('', [Validators.required]),
    aPublicacion: this.fb.control(''),
    editorial: this.fb.control(''),
    categoria: this.fb.control(''),
    sede: this.fb.control('')
  });
  
  esEdicion = signal(false);
  libroId = signal<string | null>(null);
  loading = this.libroService.loading;
  error = this.libroService.error;
  
  constructor() {
    // Reacciona automáticamente si el ID está presente para disparar la carga
    effect(() => {
      const routerId = this.id();
      if (routerId) {
        this.esEdicion.set(true);
        this.libroId.set(routerId);
        this.libroService.obtenerLibroPorId(routerId);
      }
    });
    
    // Escucha automáticamente cuando el libro carga, y parcha el formulario (sin setTimeout)
    effect(() => {
      const libro = this.libroService.selectedLibro();
      if (libro && this.esEdicion() && this.libroId() === libro._id) {
        this.libroForm.patchValue({
          titulo: libro.titulo,
          autor: libro.autor,
          aPublicacion: libro.aPublicacion || '',
          editorial: libro.editorial || '',
          categoria: libro.categoria || '',
          sede: libro.sede || ''
        });
      }
    });
  }
  
  async onSubmit() {
    if (this.libroForm.valid) {
      // TypeScript infiere automáticamente el tipo
      const libroData = this.libroForm.value;
      
      try {
        if (this.esEdicion() && this.libroId()) {
          await this.libroService.actualizarLibro(this.libroId()!, libroData);
        } else {
          await this.libroService.crearLibro(libroData as any);
        }
        this.router.navigate(['/libros']);
      } catch (error) {
        console.error("Error al guardar:", error);
      }
    }
  }
}
