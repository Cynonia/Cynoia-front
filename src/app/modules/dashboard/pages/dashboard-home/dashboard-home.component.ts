import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Réservations en attente -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Réservations en attente</h3>
              <div class="flex items-baseline">
                <p class="text-3xl font-bold text-gray-900">1</p>
                <p class="text-sm text-gray-500 ml-2">À valider</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Réservations confirmées -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Réservations confirmées</h3>
              <div class="flex items-baseline">
                <p class="text-3xl font-bold text-gray-900">1</p>
                <p class="text-sm text-gray-500 ml-2">Cette semaine</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Espaces disponibles -->
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm2 0v12h8V4H6z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900">Espaces disponibles</h3>
              <div class="flex items-baseline">
                <p class="text-3xl font-bold text-gray-900">3</p>
                <p class="text-sm text-gray-500 ml-2">Espaces actifs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Réservations récentes -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Réservations récentes</h3>
            <a href="#" class="text-sm text-purple-600 hover:text-purple-800">Voir tout</a>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <!-- Réservation 1 -->
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">Bureau privé 101</h4>
                <div class="flex items-center text-sm text-gray-500 mt-1">
                  <span>Marie Diallo</span>
                  <span class="mx-2">•</span>
                  <span>2025-01-15</span>
                  <span class="mx-2">•</span>
                  <span>9h-12h</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  En attente
                </span>
                <button class="px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700">
                  Valider
                </button>
              </div>
            </div>

            <!-- Réservation 2 -->
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">Salle de réunion Alpha</h4>
                <div class="flex items-center text-sm text-gray-500 mt-1">
                  <span>Ahmed Kouassi</span>
                  <span class="mx-2">•</span>
                  <span>2025-01-16</span>
                  <span class="mx-2">•</span>
                  <span>14h-16h</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Confirmé
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardHomeComponent {}