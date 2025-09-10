import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-create-organisation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <header class="flex justify-between items-center px-6 py-4 border-b">
        <img src="assets/images/logo.svg" alt="Cynoia" class="h-8" />
        <button class="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <img src="assets/images/avatar.png" alt="" class="w-8 h-8 rounded-full" />
          <span>Déconnexion</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </header>

      <!-- Main Content -->
      <main class="max-w-2xl mx-auto px-4 py-12">
        <div class="text-center mb-8">
          <div class="flex justify-center mb-4">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full bg-orange-400"></div>
              <div class="w-8 h-8 rounded-full bg-green-400"></div>
              <div class="w-8 h-8 rounded-full bg-blue-400"></div>
              <div class="w-8 h-8 rounded-full bg-red-400"></div>
            </div>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Meet Your Organization!</h1>
          <p class="mt-2 text-gray-600">Your team's home base in Cynoia Where you'll get work done together.</p>
        </div>

        <form [formGroup]="organisationForm" (ngSubmit)="onSubmit()" class="space-y-6 bg-white rounded-lg shadow-sm p-8">
          <ui-input
            label="Nom de l'organisation"
            type="text"
            placeholder="Edacy Team 18"
            formControlName="name"
            [error]="getFieldError('name')"
            [touched]="isFieldTouched('name')"
            required
          ></ui-input>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              URL de l'espace de travail <span class="text-red-500">*</span>
            </label>
            <div class="flex">
              <input
                type="text"
                formControlName="workspace"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="edacy-team-18"
              />
              <span class="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50">
                .cynoia.app
              </span>
            </div>
          </div>

          <ui-input
            label="Site Web ou LinkedIn de l'entreprise"
            type="url"
            placeholder="https://cynoia.com ou linkedin.com/company/cynoia"
            formControlName="website"
            [error]="getFieldError('website')"
            [touched]="isFieldTouched('website')"
          ></ui-input>

          <div class="flex gap-4 pt-6">
            <button
              type="button"
              (click)="onCancel()"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <ui-button
              type="submit"
              variant="primary"
              [fullWidth]="true"
              [loading]="loading"
              [disabled]="organisationForm.invalid"
            >
              Commencez maintenant!
            </ui-button>
          </div>
        </form>
      </main>
    </div>
  `
})
export class CreateOrganisationComponent {
  organisationForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.organisationForm = this.fb.group({
      name: ['', [Validators.required]],
      workspace: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]],
      website: ['', [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]]
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.organisationForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['pattern']) {
        if (fieldName === 'workspace') return 'Utilisez uniquement des lettres minuscules, chiffres et tirets';
        if (fieldName === 'website') return 'URL invalide';
      }
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
      // Add your API call here
    }
  }

  onCancel() {
    // Add navigation logic
  }
}