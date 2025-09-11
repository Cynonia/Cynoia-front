import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/services';
import { OrganisationService } from '../../../../core/services/organisation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-organisation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Header -->
      <header
        class="flex justify-between items-center px-6 py-4 bg-white shadow-md"
      >
        <img src="assets/images/logo.svg" alt="Cynoia" class="h-8" />
        <button
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <img
            src="/assets/images/Webinar-pana.png"
            alt=""
            class="w-8 h-8 rounded-full"
          />
          <span>Déconnexion</span>
        </button>
      </header>

      <!-- Main -->
      <main class="flex-grow flex justify-center items-start py-12 px-4">
        <div class="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg">
          <!-- Title -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900">
              Créer votre organisation
            </h1>
            <p class="text-gray-600 mt-2">
              Votre espace pour gérer votre équipe et vos projets.
            </p>
          </div>

          <!-- Form -->
          <form
            [formGroup]="organisationForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
            <!-- Organisation Identity -->
            <div class="space-y-4">
              <label class="block text-gray-700 font-medium"
                >Nom de l'entreprise <span class="text-red-500">*</span></label
              >
              <ui-input
                type="text"
                placeholder="Ex: Bakemono"
                formControlName="name"
                [error]="getFieldError('name')"
                [touched]="isFieldTouched('name')"
              ></ui-input>

              <label class="block text-gray-700 font-medium"
                >Domaine <span class="text-red-500">*</span></label
              >
              <ui-input
                type="text"
                placeholder="Ex: bakemono.com"
                formControlName="domaine"
                [error]="getFieldError('domaine')"
                [touched]="isFieldTouched('domaine')"
              ></ui-input>

              <label class="block text-gray-700 font-medium"
                >Logo de l'entreprise</label
              >
              <ui-input
                type="url"
                placeholder="URL du logo"
                formControlName="logo"
                [error]="getFieldError('logo')"
                [touched]="isFieldTouched('logo')"
              ></ui-input>
            </div>

            <!-- Branding -->
            <div class="space-y-4">
              <label class="block text-gray-700 font-medium"
                >Couleur principale</label
              >
              <ui-input type="color" formControlName="couleur"></ui-input>

              <label class="block text-gray-700 font-medium">Avatar</label>
              <ui-input
                type="url"
                placeholder="URL de l'avatar"
                formControlName="avatar"
                [error]="getFieldError('avatar')"
                [touched]="isFieldTouched('avatar')"
              ></ui-input>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-4 pt-6">
              <ui-button variant="outline" [fullWidth]="true">
                Annuler
              </ui-button>

              <ui-button
                type="submit"
                variant="primary"
                [fullWidth]="true"
                [loading]="loading"
                [disabled]="organisationForm.invalid"
              >
                Commencer maintenant
              </ui-button>
            </div>
          </form>
        </div>
      </main>
    </div>
  `,
})
export class CreateOrganisationComponent {
  organisationForm: FormGroup;
  loading = false;
  currentUser$ = this.authService.currentUser$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private organisationService: OrganisationService,
    private router : Router
  ) {
    this.organisationForm = this.fb.group({
      name: ['', [Validators.required]],
      logo: ['', [Validators.required]],
      couleur: ['', [Validators.required]],
      avatar: ['', [Validators.required]],
      domaine: ['', [Validators.required]],
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.organisationForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est requis';
    }
    return '';
  }

  isFieldTouched(fieldName: string): boolean {
    return this.organisationForm.get(fieldName)?.touched || false;
  }

  onSubmit() {
    if (this.organisationForm.valid) {
      this.loading = true;
      console.log(this.organisationForm.value);
      const formData = {
        name: this.organisationForm.get('name')?.value,
        logo: this.organisationForm.get('logo')?.value,
        couleur: this.organisationForm.get('couleur')?.value,
        avatar: this.organisationForm.get('avatar')?.value,
        domaine: this.organisationForm.get('domaine')?.value,
      };
      this.organisationService.createOrganisation(formData)
      .subscribe({
      next: (response) => {
        console.log("Inscription réussie ✅", response);
        this.loading = false;

        this.router.navigate([""])
      },
      error: (err) => {
        console.error("Erreur d'inscription ❌", err);
        this.loading = false;
      }
    });

      // Add your API call here
    }
  }

  onCancel() {
    // Add navigation logic
  }
}
