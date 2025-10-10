import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FinanceService } from '../../../../core/services/finance.service';
import { InteractiveChartComponent } from '../../../../shared/components/charts/interactive-chart.component';

@Component({
  selector: 'app-analyse-financiere',
  standalone: true,
  imports: [CommonModule, InteractiveChartComponent],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button (click)="goBack()" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Analyse financière</h1>
            <p class="text-gray-600">Suivi des revenus, paiements et performance financière</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Exporter</span>
          </button>
          <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option>12 derniers mois</option>
            <option>6 derniers mois</option>
            <option>3 derniers mois</option>
            <option>Cette année</option>
          </select>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Revenus totaux -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-900">{{ formatCurrency(kpiData.totalRevenue) }}</h3>
              <p class="text-sm text-gray-600">Revenus totaux</p>
            </div>
          </div>
        </div>

        <!-- Ce mois -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-900">{{ formatCurrency(kpiData.thisMonth) }}</h3>
              <p class="text-sm text-gray-600">Ce mois</p>
            </div>
          </div>
        </div>

        <!-- En attente -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-900">{{ formatCurrency(kpiData.pending) }}</h3>
              <p class="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>

        <!-- En retard -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-900">{{ formatCurrency(kpiData.overdue) }}</h3>
              <p class="text-sm text-gray-600">En retard</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              *ngFor="let tab of tabs"
              (click)="activeTab = tab.id"
              [class]="getTabClass(tab.id)"
              class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap">
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Vue d'ensemble -->
          <div *ngIf="activeTab === 'overview'">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Évolution des revenus -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Évolution des revenus</h3>
                <div class="h-64">
                  <app-interactive-chart 
                    [data]="monthlyRevenueData"
                    [type]="'line'"
                    [title]="'Évolution des revenus'"
                    [subtitle]="'Jan - Déc 2025'"
                    [height]="256">
                  </app-interactive-chart>
                </div>
              </div>

              <!-- Répartition des paiements -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-4">Répartition des paiements</h3>
                <div class="h-64">
                  <app-interactive-chart 
                    [data]="paymentStatusData"
                    [type]="'doughnut'"
                    [title]="'Répartition des paiements'"
                    [subtitle]="'Par statut'"
                    [height]="256"
                    [showLegend]="true">
                  </app-interactive-chart>
                </div>
              </div>
            </div>
          </div>

          <!-- Paiements -->
          <div *ngIf="activeTab === 'payments'">
            <div class="space-y-4">
              <!-- Recherche et filtres -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input type="text" placeholder="Rechercher un paiement..." 
                           class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  </div>
                  <select class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>Tous les statuts</option>
                    <option>Payé</option>
                    <option>En attente</option>
                    <option>En retard</option>
                  </select>
                </div>
                <button 
                  (click)="navigateToPayments()"
                  class="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <span>Voir tous les paiements</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>

              <!-- Table des paiements -->
              <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 class="text-sm font-medium text-gray-900">Historique des paiements ({{ payments.length }})</h3>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Espace</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'échéance</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de paiement</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let payment of payments" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div class="text-sm font-medium text-gray-900">{{ payment.memberName }}</div>
                            <div class="text-sm text-gray-500">{{ payment.memberLocation }}</div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ payment.spaceName }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {{ formatCurrency(payment.amount) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span [class]="getStatusClass(payment.status)" 
                                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                            {{ getStatusLabel(payment.status) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center space-x-2">
                            <div [class]="getMethodIcon(payment.method)">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z"/>
                              </svg>
                            </div>
                            <span class="text-sm text-gray-900">{{ payment.method }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ formatDate(payment.dueDate) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ payment.paidDate ? formatDate(payment.paidDate) : '-' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div class="flex items-center space-x-2">
                            <button class="text-purple-600 hover:text-purple-800">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            </button>
                            <button class="text-red-600 hover:text-red-800">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Par espace -->
          <div *ngIf="activeTab === 'spaces'">
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">Revenus par espace</h3>
              
              <!-- Graphique -->
              <div class="h-64">
                <app-interactive-chart 
                  [data]="spaceRevenueChartData"
                  [type]="'bar'"
                  [title]="'Revenus par espace'"
                  [subtitle]="'Répartition par type d espace'"
                  [height]="256">
                </app-interactive-chart>
              </div>

              <!-- Détails par espace -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngFor="let space of spaceRevenues" class="bg-white border border-gray-200 rounded-lg p-6">
                  <div class="flex items-center space-x-3 mb-4">
                    <div class="p-2 bg-purple-100 rounded-lg">
                      <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm2 0v12h8V4H6z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-lg font-semibold text-gray-900">{{ space.name }}</h4>
                      <p class="text-sm text-gray-600">{{ space.reservations }} réservation{{ space.reservations > 1 ? 's' : '' }}</p>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="text-2xl font-bold text-purple-600">{{ formatCurrency(space.revenue) }}</div>
                    <div class="text-sm text-gray-600">Moyenne par réservation: {{ formatCurrency(space.avgPerReservation) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Par membre -->
          <div *ngIf="activeTab === 'members'">
            <div class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">Revenus par membre</h3>
              
              <!-- Graphique -->
              <div class="h-64">
                <app-interactive-chart 
                  [data]="memberRevenueChartData"
                  [type]="'bar'"
                  [title]="'Revenus par membre'"
                  [subtitle]="'Top membres contributeurs'"
                  [height]="256">
                </app-interactive-chart>
              </div>

              <!-- Détails par membre -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div *ngFor="let member of memberRevenues" class="bg-white border border-gray-200 rounded-lg p-6">
                  <div class="flex items-center space-x-3 mb-4">
                    <div class="p-2 bg-blue-100 rounded-lg">
                      <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-lg font-semibold text-gray-900">{{ member.name }}</h4>
                      <p class="text-sm text-gray-600">{{ member.reservations }} réservation{{ member.reservations > 1 ? 's' : '' }}</p>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(member.revenue) }}</div>
                    <div class="text-sm text-gray-600">Moyenne par réservation: {{ formatCurrency(member.avgPerReservation) }}</div>
                    <div *ngIf="member.outstandingAmount > 0" class="text-sm text-orange-600">
                      Montant dû: {{ formatCurrency(member.outstandingAmount) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytiques -->
          <div *ngIf="activeTab === 'analytics'">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Méthodes de paiement populaires -->
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Méthodes de paiement populaires</h3>
                <div class="space-y-4">
                  <div *ngFor="let method of paymentMethods" class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div [class]="getMethodIcon(method.name)">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z"/>
                        </svg>
                      </div>
                      <span class="text-sm font-medium text-gray-900">{{ method.name }}</span>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-gray-900">{{ method.count }} paiements</div>
                      <div class="text-xs text-gray-500">{{ method.percentage }}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tendances mensuelles -->
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Tendances mensuelles</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Revenus moyens par mois</span>
                    <span class="text-sm font-medium text-gray-900">{{ formatCurrency(analytics.avgMonthlyRevenue) }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Meilleur mois</span>
                    <span class="text-sm font-medium text-gray-900">{{ analytics.bestMonth }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Taux de paiement</span>
                    <span class="text-sm font-medium text-gray-900">{{ analytics.paymentRate }}%</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Délai moyen de paiement</span>
                    <span class="text-sm font-medium text-gray-900">+{{ analytics.avgPaymentDelay }} jours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalyseFinanciereComponent implements OnInit {
  activeTab = 'overview';
  
  tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'payments', label: 'Paiements' },
    { id: 'spaces', label: 'Par espace' },
    { id: 'members', label: 'Par membre' },
    { id: 'analytics', label: 'Analytiques' }
  ];

  kpiData = {
    totalRevenue: 170000,
    thisMonth: 0,
    pending: 30000,
    overdue: 15000
  };

  payments = [
    {
      memberName: 'Marie Diallo',
      memberLocation: 'Location bureau privé - 1 jour',
      spaceName: 'Bureau privé 101',
      amount: 45000,
      status: 'paid',
      method: 'Mobile Money',
      dueDate: new Date('2024-12-15'),
      paidDate: new Date('2024-12-13')
    },
    {
      memberName: 'Ahmed Kouassi',
      memberLocation: 'Réservation salle de réunion - 2h',
      spaceName: 'Salle de réunion Alpha',
      amount: 50000,
      status: 'paid',
      method: 'Virement bancaire',
      dueDate: new Date('2024-12-18'),
      paidDate: new Date('2024-12-20')
    },
    {
      memberName: 'Marie Diallo',
      memberLocation: 'Location bureau privé - 2 jours',
      spaceName: 'Bureau privé 101',
      amount: 30000,
      status: 'pending',
      method: 'Mobile Money',
      dueDate: new Date('2025-01-20'),
      paidDate: null
    },
    {
      memberName: 'Fatou Ndiaye',
      memberLocation: 'Location projecteur - 3 jours',
      spaceName: 'Projecteur HD',
      amount: 15000,
      status: 'overdue',
      method: 'Espèces',
      dueDate: new Date('2024-12-30'),
      paidDate: null
    },
    {
      memberName: 'Ahmed Kouassi',
      memberLocation: 'Réservation salle de réunion - 3h',
      spaceName: 'Salle de réunion Alpha',
      amount: 75000,
      status: 'paid',
      method: 'Virement bancaire',
      dueDate: new Date('2024-11-22'),
      paidDate: new Date('2024-11-25')
    }
  ];

  spaceRevenues = [
    {
      name: 'Bureau privé 101',
      reservations: 1,
      revenue: 45000,
      avgPerReservation: 45000
    },
    {
      name: 'Salle de réunion Alpha',
      reservations: 2,
      revenue: 125000,
      avgPerReservation: 62500
    }
  ];

  memberRevenues = [
    {
      name: 'Marie Diallo',
      reservations: 1,
      revenue: 45000,
      avgPerReservation: 45000,
      outstandingAmount: 30000
    },
    {
      name: 'Ahmed Kouassi',
      reservations: 2,
      revenue: 125000,
      avgPerReservation: 62500,
      outstandingAmount: 0
    }
  ];

  paymentMethods = [
    { name: 'Mobile Money', count: 1, percentage: 60 },
    { name: 'Virement bancaire', count: 2, percentage: 40 }
  ];

  analytics = {
    avgMonthlyRevenue: 170000,
    bestMonth: 'Jan (0 FCFA)',
    paymentRate: 60.0,
    avgPaymentDelay: 1.7
  };

  // Données pour les graphiques
  monthlyRevenueData = [
    { label: 'Jan', value: 170000, color: '#8b5cf6' },
    { label: 'Fév', value: 0, color: '#8b5cf6' },
    { label: 'Mar', value: 0, color: '#8b5cf6' },
    { label: 'Avr', value: 0, color: '#8b5cf6' },
    { label: 'Mai', value: 0, color: '#8b5cf6' },
    { label: 'Juin', value: 0, color: '#8b5cf6' }
  ];

  paymentStatusData = [
    { label: 'Payé', value: 170000, color: '#10b981' },
    { label: 'En attente', value: 30000, color: '#f59e0b' },
    { label: 'En retard', value: 15000, color: '#ef4444' }
  ];

  spaceRevenueChartData = [
    { label: 'Bureau privé 101', value: 45000, color: '#8b5cf6' },
    { label: 'Salle de réunion Alpha', value: 125000, color: '#06b6d4' }
  ];

  memberRevenueChartData = [
    { label: 'Marie Diallo', value: 45000, color: '#10b981' },
    { label: 'Ahmed Kouassi', value: 125000, color: '#f59e0b' }
  ];

  constructor(
    private financeService: FinanceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFinancialData();
  }

  private loadFinancialData() {
    // Charger les données financières depuis le service
    // this.financeService.getAnalytics().subscribe(data => {
    //   this.kpiData = data.kpi;
    //   this.payments = data.payments;
    //   // etc.
    // });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  navigateToPayments() {
    this.router.navigate(['/dashboard/finances/paiements']);
  }

  getTabClass(tabId: string): string {
    return tabId === this.activeTab
      ? 'border-purple-500 text-purple-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  }

  getMethodIcon(method: string): string {
    switch (method.toLowerCase()) {
      case 'mobile money':
        return 'text-green-600';
      case 'virement bancaire':
        return 'text-blue-600';
      case 'espèces':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
}