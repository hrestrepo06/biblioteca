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
    // Reacciona automáticamente si el ID está presente
    effect(() => {
      const routerId = this.id();
      if (routerId) {
        this.esEdicion.set(true);
        this.libroId.set(routerId);
        this.cargarLibro(routerId);
      }
    });
  }
  
  cargarLibro(id: string) {
    this.libroService.obtenerLibroPorId(id);
    setTimeout(() => {
      const libro = this.libroService.selectedLibro();
      if (libro) {
        this.libroForm.patchValue({
          titulo: libro.titulo,
          autor: libro.autor,
          aPublicacion: libro.aPublicacion || '',
          editorial: libro.editorial || '',
          categoria: libro.categoria || '',
          sede: libro.sede || ''
        });
      }
    }, 100);
  }
  
  onSubmit() {
    if (this.libroForm.valid) {
      // TypeScript infiere automáticamente el tipo
      const libroData = this.libroForm.value;
      
      if (this.esEdicion() && this.libroId()) {
        this.libroService.actualizarLibro(this.libroId()!, libroData);
        setTimeout(() => {
          this.router.navigate(['/libros']);
        }, 500);
      } else {
        this.libroService.crearLibro(libroData as any);
        setTimeout(() => {
          this.router.navigate(['/libros']);
        }, 500);
      }
    }
  }
}
