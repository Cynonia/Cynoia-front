import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-workers-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <!-- Logo et titre -->
        <div class="flex items-center gap-3 p-6 border-b border-gray-100">
          <div class="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
            <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div>
            <h1 class="font-bold text-xl text-gray-900">Cynoia Spaces</h1>
            <p class="text-orange-600 text-sm font-medium">Mode Membre</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1">
          <a 
            routerLink="/workers/espaces-disponibles"
            routerLinkActive="bg-purple-600 text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-4 text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 group">
            <svg class="w-5 h-5 flex-shrink-0 group-[.router-link-active]:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0z"/>
            </svg>
            <span class="font-medium">Espaces disponibles</span>
          </a>

          <a 
            routerLink="/workers/mes-reservations"
            routerLinkActive="bg-purple-600 text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center justify-between text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 group">
            <div class="flex items-center gap-4">
              <svg class="w-5 h-5 flex-shrink-0 group-[.router-link-active]:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span class="font-medium">Mes réservations</span>
            </div>
            <span *ngIf="reservationsCount > 0" 
                  class="w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {{ reservationsCount }}
            </span>
          </a>

          <a 
            routerLink="/workers/messages"
            routerLinkActive="bg-purple-600 text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-4 text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 group">
            <svg class="w-5 h-5 flex-shrink-0 group-[.router-link-active]:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span class="font-medium">Messages</span>
          </a>

          <a 
            routerLink="/workers/historique-paiements"
            routerLinkActive="bg-purple-600 text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-4 text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 group">
            <svg class="w-5 h-5 flex-shrink-0 group-[.router-link-active]:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <span class="font-medium">Historique des paiements</span>
          </a>

          <a 
            routerLink="/workers/historique-reservations"
            routerLinkActive="bg-purple-600 text-white"
            [routerLinkActiveOptions]="{exact: false}"
            class="flex items-center gap-4 text-gray-700 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 group">
            <svg class="w-5 h-5 flex-shrink-0 group-[.router-link-active]:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="font-medium">Historique des réservations</span>
          </a>
        </nav>

        <!-- Profil utilisateur en bas -->
        <div class="p-6 border-t border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span class="text-gray-600 font-semibold">{{ userInitials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ userName }}</p>
              <p class="text-gray-600 text-sm truncate">{{ userEmail }}</p>
            </div>
          </div>
          
          <!-- Statistiques utilisateur -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 mb-1">Réservations actives:</p>
              <p class="font-semibold text-gray-900">{{ reservationsActives }}</p>
            </div>
            <div>
              <p class="text-gray-500 mb-1">En attente:</p>
              <p class="font-semibold text-gray-900">{{ reservationsEnAttente }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="flex-1">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h1>
            
            <div class="flex items-center gap-4">
              <!-- Menu utilisateur -->
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-purple-600 font-medium text-sm">{{ userInitials }}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenu de la page -->
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class WorkersLayoutComponent {
  pageTitle = 'Dashboard';
  reservationsCount = 1; // À connecter avec le service
  userName = 'Marie Diallo';
  userEmail = 'marie.diallo@example.com';
  userInitials = 'MD';
  reservationsActives = 1;
  reservationsEnAttente = 1;
}