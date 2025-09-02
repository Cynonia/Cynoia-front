import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupFormComponent } from '../../components/signup-form/signup-form.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, SignupFormComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center px-4 sm:px-6 lg:px-8">
      <!-- Header with Logo -->
      <div class="flex items-center justify-between w-full py-4">
        <img src="assets/images/logo.svg" class="self-start" alt="Logo" width="150" height="150" />
        <!-- Language Selector -->
        <div class="text-sm">
          <select class="bg-transparent border-none text-gray-600">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <!-- Main Content -->
      <main class="h-full flex-1 flex flex-col items-center justify-center w-full max-w-md">
        <div class="w-full bg-white p-8 rounded-lg shadow-lg animate-fade-in">
          <div class="text-center mb-6">
            <h1 class="text-3xl font-semibold text-slate-800">S'inscrire</h1>
            <p class="mt-2 text-gray-600">Préparez votre compte pour rejoindre vos coéquipiers !</p>
          </div>

          <!-- Social Buttons -->
          <div class="space-y-3 mb-6">
            <button class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <img src="assets/icons/google.svg" alt="Google" class="w-5 h-5" />
              Se connecter avec Google
            </button>
            <button class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <img src="assets/icons/linkedin.svg" alt="LinkedIn" class="w-5 h-5" />
              Se connecter avec LinkedIn
            </button>
          </div>

          <div class="relative mb-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <app-signup-form></app-signup-form>

          <!-- Footer -->
          <div class="mt-6 text-center text-sm">
            <p class="text-gray-600">
              Vous avez déjà un compte? 
              <a href="/auth/signin" class="text-purple-600 hover:text-purple-500 font-medium">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  `
})
export class SignupComponent {}