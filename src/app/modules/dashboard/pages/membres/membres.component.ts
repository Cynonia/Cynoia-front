import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-membres',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Membres</h2>
        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Inviter un membre
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Équipe (3 membres)</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-medium">MS</span>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">Mady Samoura</p>
                  <p class="text-sm text-gray-500">Propriétaire</p>
                </div>
              </div>
              <span class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Propriétaire</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-gray-600 font-medium">MD</span>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">Marie Diallo</p>
                  <p class="text-sm text-gray-500">Gestionnaire</p>
                </div>
              </div>
              <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Admin</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-gray-600 font-medium">AK</span>
                </div>
                <div class="ml-3">
                  <p class="font-medium text-gray-900">Ahmed Kouassi</p>
                  <p class="text-sm text-gray-500">Membre</p>
                </div>
              </div>
              <span class="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Membre</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MembresComponent {}