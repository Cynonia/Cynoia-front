import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Réservations</h2>
        <div class="flex gap-2">
          <select class="border border-gray-300 rounded-lg px-3 py-2">
            <option>Toutes les réservations</option>
            <option>En attente</option>
            <option>Confirmées</option>
            <option>Annulées</option>
          </select>
        </div>
      </div>

      <!-- Table des réservations -->
      <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Espace</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium">MD</span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">Marie Diallo</div>
                    <div class="text-sm text-gray-500">marie@example.com</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Bureau privé 101</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15 Jan 2025, 9h-12h</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">En attente</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-green-600 hover:text-green-900 mr-3">Valider</button>
                <button class="text-red-600 hover:text-red-900">Refuser</button>
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium">AK</span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">Ahmed Kouassi</div>
                    <div class="text-sm text-gray-500">ahmed@example.com</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Salle de réunion Alpha</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">16 Jan 2025, 14h-16h</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Confirmé</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">Voir</button>
                <button class="text-red-600 hover:text-red-900">Annuler</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ReservationsComponent {}