import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupFormComponent } from '../../components/signup-form/signup-form.component';
import { AuthHeaderComponent } from '../../../../shared/components/ui/header/header.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, SignupFormComponent,AuthHeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center px-4 sm:px-6 lg:px-8">
      <!-- Header with Logo -->
      <div class="flex items-start w-full">
      <auth-header class="flex-1"/>
    </div>
      <!-- Main Content -->
      <main class="h-full flex-1 flex flex-col items-center justify-center w-full max-w-xl">
        <div class="w-full bg-white p-8 rounded-lg shadow-lg animate-fade-in">
          <div class="text-center ">
            <h1 class="text-3xl font-semibold text-slate-800">S'inscrire</h1>
            <p class="mt-2 text-gray-600">Préparez votre compte pour rejoindre vos coéquipiers !</p>
          </div>

          <app-signup-form></app-signup-form>

          <!-- Footer -->
          <div class="mt-6 text-center text-sm">
            <p class="text-gray-600">
              Vous avez déjà un compte? 
              <a href="/auth/login" class="text-purple-600 hover:text-purple-500 font-medium">
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