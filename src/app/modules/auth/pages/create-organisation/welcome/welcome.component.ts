import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <header class="flex justify-between items-center px-6 py-4 border-b">
        <img src="assets/images/logo.svg" alt="Cynoia" class="h-8" />
        <button
        (click)="logout()"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <img
            src="/assets/images/Webinar-pana.png"
            alt=""
            class="w-8 h-8 rounded-full"
          />
          <span>Déconnexion</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </header>

      <!-- Main Content -->
      <main class="max-w-2xl mx-auto px-4 py-12 text-center">
        <!-- Welcome Illustration -->
        <div class="mb-8">
          <img
            src="../../../../../../assets/images/Webinar-pana.png"
            alt="Welcome"
            class="w-64 h-64 mx-auto"
          />
        </div>


        <h1 class="text-3xl font-bold text-gray-900 mb-4" *ngIf="currentUser$ | async as user">Bienvenue {{user.firstName + " " + user.lastName}}!</h1>

        <p class="text-gray-600 mb-8 text-lg">
          Aucune organisation pour le moment. Voulez-vous en créer une ?
        </p>

        <button
          (click)="createOrganization()"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Créer une organisation
        </button>
      </main>
    </div>
  `,
})

export class WelcomeComponent {
  currentUser$ = this.authService.currentUser$;
  constructor(private router: Router, private authService: AuthService) {}
  createOrganization() {
    this.router.navigate(['/auth/create-organisation/new']);
  }

  logout(): void {
    this.authService.signOut();
    console.log("deconn");
    
  }
}
