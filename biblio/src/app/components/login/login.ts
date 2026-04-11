import { Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── Formulario reactivo ────────────────────────────────────────────
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // ── Señales de estado ──────────────────────────────────────────────
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  hasError = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  // ── Computed: validaciones inline ─────────────────────────────────
  emailInvalid = computed(() => {
    const ctrl = this.loginForm.get('email');
    return ctrl ? ctrl.invalid && ctrl.touched : false;
  });

  passwordInvalid = computed(() => {
    const ctrl = this.loginForm.get('password');
    return ctrl ? ctrl.invalid && ctrl.touched : false;
  });

  currentYear = new Date().getFullYear();

  // ── Métodos ────────────────────────────────────────────────────────
  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.hasError.set(false);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Redirigir a la URL original o a libros por defecto
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/libros';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.hasError.set(true);

        if (err.status === 401) {
          this.errorMessage.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } else if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar al servidor. Intenta más tarde.');
        } else {
          this.errorMessage.set('Ocurrió un error inesperado. Intenta de nuevo.');
        }

        // Limpia el estado de shake después de la animación
        setTimeout(() => this.hasError.set(false), 500);
      },
      complete: () => this.isLoading.set(false),
    });
  }
}
