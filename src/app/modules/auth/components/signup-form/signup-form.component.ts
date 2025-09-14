import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/services';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: "./signup-form.component.html"
})
export class SignupFormComponent {
  signupForm: FormGroup;
  loading = false;


  constructor(private fb: FormBuilder,private authService : AuthService,private router : Router) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      login: ['',[Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value ? 
      null : { 'passwordMismatch': true };
  }

  getFieldError(fieldName: string): string {
    const control = this.signupForm.get(fieldName);

    if (fieldName === 'confirmPassword' && this.signupForm.errors?.['passwordMismatch'] && control?.touched) {
    return 'Les mots de passe ne correspondent pas';
  }

    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['minlength']) return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    return '';
  }

  isFieldTouched(fieldName: string): boolean {
    return this.signupForm.get(fieldName)?.touched || false;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      console.log(this.signupForm.value);
      this.authService.signUp(this.signupForm.value).subscribe({
      next: (response) => {
        console.log("Inscription réussie ✅", response);
        this.loading = false;

        this.router.navigate(["/auth/create-organisation"])
      },
      error: (err) => {
        console.error("Erreur d'inscription ❌", err);
        this.loading = false;
      }
    });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}