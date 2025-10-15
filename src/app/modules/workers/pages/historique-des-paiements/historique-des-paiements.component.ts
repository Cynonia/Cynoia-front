import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionsService, Transaction } from '../../../../core/services/transactions.service';

@Component({
  selector: 'app-historique-des-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Historique des paiements</h1>
        <p class="text-gray-600">Consultez tous vos paiements et transactions</p>
      </div>

      <!-- Statistiques financières -->
      <div class="grid grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total payé</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalPaye | number }} FCFA</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">En attente</p>
              <p class="text-2xl font-bold text-orange-600">{{ stats.enAttente | number }} FCFA</p>
            </div>
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Transactions</p>
              <p class="text-2xl font-bold text-purple-600">{{ stats.transactions }}</p>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres et actions -->
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between gap-4">
          <!-- Recherche -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                placeholder="Rechercher par espace, description ou ID trans..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
          </div>

          <!-- Filtres -->
          <div class="flex gap-2">
            <select 
              [(ngModel)]="statusFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Tous statuts</option>
              <option value="paye">Payé</option>
              <option value="en-attente">En attente</option>
              <option value="echec">Échec</option>
              <option value="rembourse">Remboursé</option>
            </select>

            <select 
              [(ngModel)]="methodFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Toutes méthodes</option>
              <option value="mobile-money">Mobile Money</option>
              <option value="carte-bancaire">Carte bancaire</option>
              <option value="virement">Virement bancaire</option>
            </select>

            <select 
              [(ngModel)]="periodFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Toute période</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
            </select>

            <button 
              (click)="exportTransactions()"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Exporter
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des transactions -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900">Transactions ({{ getFilteredTransactions().length }})</h3>
        </div>

        <div class="divide-y divide-gray-200">
          <div *ngFor="let transaction of getFilteredTransactions()" 
               class="p-4 hover:bg-gray-50 transition-colors">
            
            <div class="flex items-start justify-between">
              <!-- Icône et détails -->
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ transaction.spaceName }}</h4>
                  <p class="text-sm text-gray-600">{{ transaction.description }}</p>
                  <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Réf: {{ transaction.reference }}</span>
                    <span>ID: {{ transaction.transactionId }}</span>
                  </div>
                  
                  <!-- Méthode de paiement -->
                  <div class="flex items-center gap-2 mt-2">
                    <div class="flex items-center gap-1 text-xs text-gray-600">
                      <svg *ngIf="transaction.paymentMethod === 'mobile-money'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                      <svg *ngIf="transaction.paymentMethod === 'carte-bancaire'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                      <svg *ngIf="transaction.paymentMethod === 'virement'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10.1V17a1 1 0 001 1h14a1 1 0 001-1v-6.9"/>
                      </svg>
                      <span>{{ getPaymentMethodLabel(transaction.paymentMethod) }}</span>
                    </div>
                    <span class="text-gray-400">•</span>
                    <span class="text-xs text-gray-600">{{ transaction.date }}</span>
                  </div>
                </div>
              </div>

              <!-- Montant et statut -->
              <div class="flex flex-col items-end gap-2">
                <div class="text-lg font-bold text-gray-900">
                  {{ transaction.amount | number }} FCFA
                </div>
                
                <span 
                  [class]="getStatusClass(transaction.status)"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium">
                  {{ getStatusLabel(transaction.status) }}
                </span>

                <!-- Action pour les paiements en attente -->
                <button *ngIf="transaction.status === 'en-attente'" 
                        (click)="payNow(transaction.id)"
                        class="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">
                  Payer maintenant
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div *ngIf="getFilteredTransactions().length === 0" 
             class="p-12 text-center text-gray-500">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p class="font-medium text-gray-900 mb-1">Aucune transaction trouvée</p>
          <p>Aucune transaction ne correspond à vos critères de recherche.</p>
        </div>
      </div>
    </div>
  `
})
export class HistoriqueDesPaiementsComponent implements OnInit {
  searchTerm = '';
  statusFilter = '';
  methodFilter = '';
  periodFilter = '';

  stats = {
    totalPaye: 0,
    enAttente: 0,
    transactions: 0
  };
  transactions: Array<{
    id: number | string;
    spaceName: string;
    description: string;
    reference: string;
    transactionId: string;
    paymentMethod: string;
    date: string;
    amount: number;
    status: string;
  }> = [];

  constructor(private router: Router, private transactionsService: TransactionsService) {}

  ngOnInit() {
    this.transactionsService.refreshFromApi();
    this.transactionsService.transactions$.subscribe((items) => {
      this.transactions = (items || []).map((t) => this.mapTransactionToUi(t));
      this.calculateStats();
    });
  }

  calculateStats() {
    const toNumber = (n: any) => (typeof n === 'number' ? n : Number(n || 0));
    this.stats.totalPaye = this.transactions
      .filter(t => t.status === 'paye')
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    this.stats.enAttente = this.transactions
      .filter(t => t.status === 'en-attente')
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    this.stats.transactions = this.transactions.length;
  }

  getFilteredTransactions() {
    return this.transactions.filter(transaction => {
      const matchesSearch = !this.searchTerm || 
        transaction.spaceName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || transaction.status === this.statusFilter;
      const matchesMethod = !this.methodFilter || transaction.paymentMethod === this.methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paye': return 'bg-green-100 text-green-700';
      case 'en-attente': return 'bg-orange-100 text-orange-700';
      case 'echec': return 'bg-red-100 text-red-700';
      case 'rembourse': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paye': return 'Payé';
      case 'en-attente': return 'En attente';
      case 'echec': return 'Échec';
      case 'rembourse': return 'Remboursé';
      default: return 'Inconnu';
    }
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'mobile-money': return 'Mobile Money';
      case 'carte-bancaire': return 'Carte bancaire';
      case 'virement': return 'Virement bancaire';
      default: return method;
    }
  }

  exportTransactions() {
    console.log('Export des transactions...');
    // Logique d'export ici
  }

  payNow(transactionId: number | string) {
    console.log('Paiement maintenant pour:', transactionId);
    // Redirection vers le paiement
    this.router.navigate(['/workers/paiement'], { 
      queryParams: { transactionId } 
    });
  }

  private mapTransactionToUi(t: Transaction) {
    const spaceName = t.reservation?.espace?.name || 'Espace';
    const description = t.description || (t.reservation ? 'Paiement réservation' : 'Paiement');
    const reference = String(t.reservation?.id || t.id || '');
    const transactionId = String((t as any).transactionId || '');
    const date = t.createdAt ? new Intl.DateTimeFormat('fr-FR').format(t.createdAt) : '';
    const status = (t.status || '').toString();
    const method = t.paymentMethod || '';
    return {
      id: t.id,
      spaceName,
      description,
      reference,
      transactionId,
      paymentMethod: method,
      date,
      amount: t.amount || 0,
      status
    };
  }
}