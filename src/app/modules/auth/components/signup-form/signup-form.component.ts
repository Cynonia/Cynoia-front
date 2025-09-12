import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { StoreService } from '../../../../core/services/store.service';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <ui-input
        label="Nom complet"
        type="text"
        placeholder="Entrez votre nom complet"
        formControlName="fullName"
        [error]="getFieldError('fullName')"
        [touched]="isFieldTouched('fullName')"
      ></ui-input>

      <ui-input
        label="E-mail"
        type="email"
        placeholder="Entrez votre e-mail"
        formControlName="email"
        [error]="getFieldError('email')"
        [touched]="isFieldTouched('email')"
      ></ui-input>

      <ui-input
        label="Numéro de téléphone"
        type="tel"
        placeholder="Entrez votre numéro de téléphone"
        formControlName="phone"
        [error]="getFieldError('phone')"
        [touched]="isFieldTouched('phone')"
      ></ui-input>

      <ui-input
        label="Mot de passe"
        type="password"
        placeholder="Entrez votre mot de passe"
        formControlName="password"
        [error]="getFieldError('password')"
        [touched]="isFieldTouched('password')"
        [showToggle]="true"
      ></ui-input>

      <ui-input
        label="Confirmez le mot de passe"
        type="password"
        placeholder="Saisissez à nouveau votre mot de passe"
        formControlName="confirmPassword"
        [error]="getFieldError('confirmPassword')"
        [touched]="isFieldTouched('confirmPassword')"
        [showToggle]="true"
      ></ui-input>

      <div class="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          id="terms"
          formControlName="acceptTerms"
          class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <label for="terms" class="text-sm text-gray-600">
          J'ai lu et j'accepte la 
          <a href="/privacy" class="text-purple-600 hover:text-purple-500">politique de confidentialité</a>
          et les
          <a href="/terms" class="text-purple-600 hover:text-purple-500">conditions de service</a>.
        </label>
      </div>

      <ui-button
        type="submit"
        variant="primary"
        [fullWidth]="true"
        [loading]="loading"
        [disabled]="signupForm.invalid"
      >
        S'inscrire
      </ui-button>
    </form>
  `
})
export class SignupFormComponent {
  signupForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private store: StoreService,
    private router: Router  // Ajouter le Router
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required]],
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
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['email']) return 'Email invalide';
      if (control.errors['minlength']) return 'Le mot de passe doit contenir au moins 8 caractères';
      if (control.errors['pattern'] && fieldName === 'phone') return 'Numéro de téléphone invalide';
      if (control.errors['passwordMismatch']) return 'Les mots de passe ne correspondent pas';
    }
    return '';
  }

  isFieldTouched(fieldName: string): boolean {
    return this.signupForm.get(fieldName)?.touched || false;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.loading = true;
      try {
        // Enregistrer les données dans le store
        const userData = {
          fullName: this.signupForm.value.fullName,
          email: this.signupForm.value.email,
          phone: this.signupForm.value.phone
        };

        this.store.saveSignupData(userData);
        console.log('Données sauvegardées:', userData);

        this.signupForm.reset();
        
        
        // Rediriger vers la page de création d'organisation
        this.router.navigate(['/auth/create-organisation']);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        this.loading = false;
      }
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