import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-espaces',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Gestion des Espaces</h2>
        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Ajouter un espace
        </button>
      </div>

      <!-- Grille des espaces -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Espace 1 -->
        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div class="h-48 bg-gray-200"></div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-900">Bureau privé 101</h3>
            <p class="text-sm text-gray-600 mt-1">Capacité: 2 personnes</p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-lg font-bold text-gray-900">50€/jour</span>
              <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Disponible</span>
            </div>
          </div>
        </div>

        <!-- Espace 2 -->
        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div class="h-48 bg-gray-200"></div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-900">Salle de réunion Alpha</h3>
            <p class="text-sm text-gray-600 mt-1">Capacité: 8 personnes</p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-lg font-bold text-gray-900">120€/jour</span>
              <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Réservé</span>
            </div>
          </div>
        </div>

        <!-- Espace 3 -->
        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div class="h-48 bg-gray-200"></div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-900">Espace coworking</h3>
            <p class="text-sm text-gray-600 mt-1">Capacité: 20 personnes</p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-lg font-bold text-gray-900">25€/jour</span>
              <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EspacesComponent {}