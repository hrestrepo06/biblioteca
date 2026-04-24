import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ROUTES } from '../../constants/app.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loginForm.reset();
  }

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  hasError = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  emailInvalid = computed(() => {
    const ctrl = this.loginForm.get('email');
    return ctrl ? ctrl.invalid && ctrl.touched : false;
  });

  passwordInvalid = computed(() => {
    const ctrl = this.loginForm.get('password');
    return ctrl ? ctrl.invalid && ctrl.touched : false;
  });

  currentYear = new Date().getFullYear();

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
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? ROUTES.LIBROS;
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.hasError.set(true);
        if (err.status === 401) {
          this.errorMessage.set('Credenciales incorrectas.');
        } else {
          this.errorMessage.set('Error inesperado.');
        }
        setTimeout(() => this.hasError.set(false), 500);
      },
      complete: () => this.isLoading.set(false),
    });
  }
}
