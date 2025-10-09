import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractiveChartComponent, ChartDataPoint } from '../../../../shared/components/charts/interactive-chart.component';

@Component({
  selector: 'app-charts-demo',
  standalone: true,
  imports: [CommonModule, InteractiveChartComponent],
  template: `
    <div class="p-6 space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Démonstration des Graphiques Interactifs</h1>
        <p class="text-gray-600">Graphiques alimentés par Chart.js avec interactions complètes</p>
      </div>

      <!-- Revenus mensuels - Graphique en ligne -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">📈 Évolution des revenus mensuels</h2>
        <div class="h-80">
          <app-interactive-chart 
            [data]="monthlyRevenueData"
            [type]="'line'"
            [title]="'Revenus mensuels'"
            [subtitle]="'Évolution de janvier à juin 2025'"
            [height]="320"
            [animate]="true"
            [showLegend]="false">
          </app-interactive-chart>
        </div>
      </div>

      <!-- Répartition des paiements - Graphique en secteurs -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">🥧 Répartition des statuts de paiement</h2>
        <div class="h-80">
          <app-interactive-chart 
            [data]="paymentStatusData"
            [type]="'doughnut'"
            [title]="'Statuts des paiements'"
            [subtitle]="'Répartition par statut'"
            [height]="320"
            [animate]="true"
            [showLegend]="true">
          </app-interactive-chart>
        </div>
      </div>

      <!-- Revenus par espace - Graphique en barres -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">📊 Revenus par espace</h2>
        <div class="h-80">
          <app-interactive-chart 
            [data]="spaceRevenueData"
            [type]="'bar'"
            [title]="'Revenus par espace'"
            [subtitle]="'Performance des différents espaces'"
            [height]="320"
            [animate]="true"
            [showLegend]="false">
          </app-interactive-chart>
        </div>
      </div>

      <!-- Méthodes de paiement - Graphique en secteurs simples -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">💳 Méthodes de paiement populaires</h2>
        <div class="h-80">
          <app-interactive-chart 
            [data]="paymentMethodData"
            [type]="'pie'"
            [title]="'Méthodes de paiement'"
            [subtitle]="'Répartition par méthode'"
            [height]="320"
            [animate]="true"
            [showLegend]="true">
          </app-interactive-chart>
        </div>
      </div>

      <!-- Contrôles interactifs -->
      <div class="bg-gray-50 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">🎮 Fonctionnalités interactives</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div class="bg-white p-4 rounded-lg border">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="font-medium">Hover/Survol</span>
            </div>
            <p class="text-gray-600">Passez la souris sur les éléments pour voir les détails</p>
          </div>
          
          <div class="bg-white p-4 rounded-lg border">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="font-medium">Animations</span>
            </div>
            <p class="text-gray-600">Animations fluides au chargement et aux interactions</p>
          </div>
          
          <div class="bg-white p-4 rounded-lg border">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span class="font-medium">Responsive</span>
            </div>
            <p class="text-gray-600">S'adapte automatiquement à la taille de l'écran</p>
          </div>
          
          <div class="bg-white p-4 rounded-lg border">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span class="font-medium">Tooltips</span>
            </div>
            <p class="text-gray-600">Informations détaillées au survol</p>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 class="text-lg font-medium text-blue-900 mb-2">💡 Comment interagir</h3>
        <ul class="list-disc list-inside space-y-1 text-blue-800">
          <li>Survolez les points, barres ou secteurs pour voir les valeurs exactes</li>
          <li>Cliquez sur les éléments de légende pour masquer/afficher des données</li>
          <li>Les graphiques sont entièrement responsives et s'adaptent à votre écran</li>
          <li>Les animations se déclenchent au chargement et aux interactions</li>
        </ul>
      </div>
    </div>
  `
})
export class ChartsDemoComponent implements OnInit {
  
  monthlyRevenueData: ChartDataPoint[] = [
    { label: 'Janvier', value: 170000, color: '#8b5cf6' },
    { label: 'Février', value: 125000, color: '#8b5cf6' },
    { label: 'Mars', value: 185000, color: '#8b5cf6' },
    { label: 'Avril', value: 220000, color: '#8b5cf6' },
    { label: 'Mai', value: 195000, color: '#8b5cf6' },
    { label: 'Juin', value: 245000, color: '#8b5cf6' }
  ];

  paymentStatusData: ChartDataPoint[] = [
    { label: 'Payé', value: 170000, color: '#10b981' },
    { label: 'En attente', value: 30000, color: '#f59e0b' },
    { label: 'En retard', value: 15000, color: '#ef4444' }
  ];

  spaceRevenueData: ChartDataPoint[] = [
    { label: 'Bureau privé 101', value: 45000, color: '#8b5cf6' },
    { label: 'Salle de réunion Alpha', value: 125000, color: '#06b6d4' },
    { label: 'Espace coworking', value: 85000, color: '#10b981' },
    { label: 'Salle de conférence', value: 65000, color: '#f59e0b' },
    { label: 'Box privé', value: 35000, color: '#ef4444' }
  ];

  paymentMethodData: ChartDataPoint[] = [
    { label: 'Mobile Money', value: 120000, color: '#10b981' },
    { label: 'Virement bancaire', value: 75000, color: '#06b6d4' },
    { label: 'Espèces', value: 15000, color: '#f59e0b' },
    { label: 'Carte bancaire', value: 5000, color: '#8b5cf6' }
  ];

  ngOnInit() {
    console.log('Démonstration des graphiques Chart.js chargée');
  }
}