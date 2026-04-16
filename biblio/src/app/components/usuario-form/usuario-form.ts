import { Component, effect, inject, signal, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios';
import { UsuarioCreate, UsuarioUpdate } from '../../models/usuario.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-form.html',
})
export class UsuarioForm {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private usuariosService = inject(UsuariosService);
  
  // ID capturado de la ruta (editar/:id)
  id = input<string>();
  
  esEdicion = signal(false);
  showPassword = false;
  loading = this.usuariosService.loading;
  error = this.usuariosService.error;
  
  usuarioForm = this.fb.group({
    nombre: this.fb.control('', [Validators.required, Validators.minLength(2)]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.minLength(6)]),
    rol: this.fb.control<'lector' | 'bibliotecario' | 'admin'>('lector', [Validators.required]),
    activo: this.fb.control(true)
  });

  constructor() {
    // Escuchar cambios en el input ID para cargar el usuario si es edición
    effect(() => {
      const usuarioId = this.id();
      if (usuarioId) {
        this.esEdicion.set(true);
        this.usuariosService.seleccionarUsuarioPorId(usuarioId);
      } else {
        this.esEdicion.set(false);
        this.usuariosService.limpiarSeleccion();
        this.usuarioForm.reset({ rol: 'lector', activo: true });
      }
    });

    // Escuchar cuando el usuario seleccionado cambia para llenar el formulario
    effect(() => {
      const usuario = this.usuariosService.selectedUsuario();
      if (usuario && this.esEdicion()) {
        this.usuarioForm.patchValue({
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          activo: usuario.activo
        });
        // La contraseña se deja vacía en edición a menos que el usuario quiera cambiarla
        this.usuarioForm.get('password')?.clearValidators();
        this.usuarioForm.get('password')?.setValidators([Validators.minLength(6)]);
        this.usuarioForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  async onSubmit() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const formRaw = this.usuarioForm.getRawValue();
    
    try {
      if (this.esEdicion()) {
        // Enviar solo los campos necesarios para actualizar
        const updateData: UsuarioUpdate = { ...formRaw };
        if (!updateData.password) delete updateData.password;
        
        await this.usuariosService.actualizarUsuario(this.id()!, updateData);
      } else {
        // Enviar datos para creación (password requerido en el modelo si es nuevo)
        if (!formRaw.password) {
           this.usuarioForm.get('password')?.setErrors({ required: true });
           return;
        }
        await this.usuariosService.crearUsuario(formRaw as UsuarioCreate);
      }
      
      this.router.navigate(['/usuarios']);
    } catch (err) {
      // El error ya fluye por el signal del servicio
    }
  }
}
