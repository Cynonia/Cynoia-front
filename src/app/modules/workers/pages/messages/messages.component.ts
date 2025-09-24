import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Messages</h1>
        <p class="text-gray-600">Communiquez avec l'équipe Cynoia</p>
      </div>

      <!-- État vide temporaire -->
      <div class="text-center py-16 bg-white rounded-lg border border-gray-200">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Messagerie bientôt disponible</h3>
        <p class="text-gray-600">Cette fonctionnalité sera implémentée prochainement.</p>
      </div>
    </div>
  `
})
export class MessagesComponent {}