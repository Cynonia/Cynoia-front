import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SignInCredentials } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent
  ],
  template: `
    <form [formGroup]="signInForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
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
        <svg slot="icon-left" class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
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
        <svg slot="icon-left" class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </ui-input>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <a href="/auth/forgot-password" class="text-sm text-blue-600 hover:text-blue-300">
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
  `
})
export class SigninFormComponent {
  @Output() formSubmit = new EventEmitter<SignInCredentials>();
  
  signInForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
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
        return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
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
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.loading = true;
      this.formSubmit.emit(this.signInForm.value);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.signInForm.controls).forEach(key => {
      this.signInForm.get(key)?.markAsTouched();
    });
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}