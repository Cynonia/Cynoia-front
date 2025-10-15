import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import {
  AuthService,
  SignInCredentials,
} from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <form
      [formGroup]="signInForm"
      (ngSubmit)="onSubmit()"
      class="flex flex-col gap-6"
    >
      <!-- Server error banner -->
      <div *ngIf="formError" class="rounded-md border border-red-200 bg-red-50 text-red-800 p-3 text-sm flex items-start gap-2">
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="leading-5">{{ formError }}</span>
      </div>
      <!-- Email Input -->
      <ui-input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        [icon]="false"
        [required]="true"
        [error]="getFieldError('email')"
        [touched]="isFieldTouched('email')"
        formControlName="email"
      >
        <svg
          slot="icon-left"
          class="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
          ></path>
        </svg>
      </ui-input>

      <!-- Password Input -->
      <ui-input
        label="Password"
        type="password"
        placeholder="Enter your password"
        [icon]="false"
        [required]="true"
        [error]="getFieldError('password')"
        [touched]="isFieldTouched('password')"
        formControlName="password"
      >
        <svg
          slot="icon-left"
          class="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          ></path>
        </svg>
      </ui-input>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <a
          href="/auth/forgot-password"
          class="text-sm text-blue-600 hover:text-blue-300"
        >
          Forgot password?
        </a>
      </div>

      <!-- Submit Button -->
      <ui-button
        type="submit"
        variant="primary"
        size="lg"
        [fullWidth]="true"
        [loading]="loading"
        [disabled]="signInForm.invalid"
      >
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </ui-button>
    </form>
  `,
})
export class SigninFormComponent {
  @Output() formSubmit = new EventEmitter<SignInCredentials>();

  signInForm: FormGroup;
  loading = false;
  formError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.signInForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors?.['minlength']) {
        const requiredLength = field.errors?.['minlength'].requiredLength;
        return `${this.getFieldLabel(
          fieldName
        )} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }

  isFieldTouched(fieldName: string): boolean {
    return this.signInForm.get(fieldName)?.touched ?? false;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      email: 'Email',
      password: 'Password',
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.formError = null;
      this.loading = true;
      console.log(this.signInForm.value);
      this.authService.signIn(this.signInForm.value).subscribe({
        next: (response) => {
          console.log('login réussie ✅', response);
          this.loading = false;
          this.formError = null;
          if (
            response.data.user.entity 
          ) {
            this.router.navigate(['/dashboard']);
          } else {
            if (response.data.user.role == 'CLIENT') {
              this.router.navigate(['/workers/espaces-disponibles']);
            } else this.router.navigate(['/auth/create-organisation']);
          }
        },
        error: (err) => {
          console.error('Erreur de la connexion ❌', err);
          this.loading = false;
          const status = err?.status ?? err?.error?.status;
          let msg = err?.error?.message || err?.message || 'Erreur lors de la connexion';
          if (status === 401 || status === 403) {
            msg = 'Email ou mot de passe incorrect.';
          } else if (status === 0) {
            msg = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
          } else if (status >= 500) {
            msg = 'Le serveur a rencontré un problème. Réessayez plus tard.';
          }
          this.formError = msg;
          this.toast.error(msg);
        },
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.signInForm.controls).forEach((key) => {
      this.signInForm.get(key)?.markAsTouched();
    });
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}
