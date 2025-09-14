import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">Paramètres</h2>
      
      <!-- Organisation Settings -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Organisation</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nom de l'organisation</label>
            <input type="text" value="Team 18" class="w-full border border-gray-300 rounded-lg px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea class="w-full border border-gray-300 rounded-lg px-3 py-2" rows="3">Espace de coworking moderne</textarea>
          </div>
        </div>
      </div>

      <!-- Branding Settings -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Branding</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold">T1</span>
              </div>
              <button class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Changer le logo
              </button>
            </div>
            <p class="text-sm text-gray-500 mt-2">Logo par défaut de Cynoia utilisé</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
            <div class="flex items-center gap-2">
              <input type="color" value="#7C3AED" class="w-12 h-10 border border-gray-300 rounded">
              <span class="text-sm text-gray-600">#7C3AED (Couleur par défaut Cynoia)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParametresComponent {}