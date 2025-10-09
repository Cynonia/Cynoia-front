import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FinanceService, Payment } from '../../../../core/services/finance.service';

@Component({
  selector: 'app-paiements-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            <h1 class="text-2xl font-bold text-gray-900">Historique des paiements</h1>
            <p class="text-gray-600">Gestion détaillée des paiements et facturations</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button (click)="exportPayments()" class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>Exporter</span>
          </button>
          <button class="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span>Nouveau paiement</span>
          </button>
        </div>
      </div>

      <!-- Filtres et Recherche -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Recherche -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input 
                type="text" 
                [(ngModel)]="searchTerm"
                (input)="applyFilters()"
                placeholder="Nom du membre, espace, référence..." 
                class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
          </div>

          <!-- Statut -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select 
              [(ngModel)]="selectedStatus"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Tous les statuts</option>
              <option value="paid">Payé</option>
              <option value="pending">En attente</option>
              <option value="overdue">En retard</option>
            </select>
          </div>

          <!-- Méthode de paiement -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Méthode</label>
            <select 
              [(ngModel)]="selectedMethod"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Toutes les méthodes</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Espèces">Espèces</option>
              <option value="Carte bancaire">Carte bancaire</option>
            </select>
          </div>

          <!-- Période -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select 
              [(ngModel)]="selectedPeriod"
              (change)="applyFilters()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Toutes les périodes</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">{{ paidCount }}</h3>
              <p class="text-sm text-gray-600">Paiements réalisés</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">{{ pendingCount }}</h3>
              <p class="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">{{ overdueCount }}</h3>
              <p class="text-sm text-gray-600">En retard</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">{{ financeService.formatCurrency(totalAmount) }}</h3>
              <p class="text-sm text-gray-600">Montant total</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Table des paiements -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Paiements ({{ filteredPayments.length }})</h3>
          <div class="flex items-center space-x-2">
            <button 
              (click)="selectAll()"
              class="text-sm text-purple-600 hover:text-purple-800">
              {{ selectedPayments.length === filteredPayments.length ? 'Désélectionner tout' : 'Sélectionner tout' }}
            </button>
            <div *ngIf="selectedPayments.length > 0" class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">{{ selectedPayments.length }} sélectionné(s)</span>
              <button 
                (click)="bulkAction('reminder')"
                class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200">
                Envoyer rappel
              </button>
              <button 
                (click)="bulkAction('delete')"
                class="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200">
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="w-8 px-6 py-3">
                  <input 
                    type="checkbox" 
                    [checked]="selectedPayments.length === filteredPayments.length && filteredPayments.length > 0"
                    (change)="selectAll()"
                    class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    (click)="sortBy('memberName')">
                  <div class="flex items-center space-x-1">
                    <span>Membre</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    (click)="sortBy('amount')">
                  <div class="flex items-center space-x-1">
                    <span>Montant</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    (click)="sortBy('dueDate')">
                  <div class="flex items-center space-x-1">
                    <span>Échéance</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                    </svg>
                  </div>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let payment of paginatedPayments; trackBy: trackByPayment" 
                  class="hover:bg-gray-50 transition-colors"
                  [class.bg-blue-50]="selectedPayments.includes(payment.id)">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    [checked]="selectedPayments.includes(payment.id)"
                    (change)="togglePaymentSelection(payment.id)"
                    class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span class="text-purple-600 font-medium text-sm">{{ getInitials(payment.memberName) }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ payment.memberName }}</div>
                      <div class="text-sm text-gray-500">Membre depuis Jan 2024</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ payment.spaceName }}</div>
                    <div class="text-sm text-gray-500">{{ payment.memberLocation }}</div>
                    <div class="text-xs text-gray-400 mt-1">Ref: #{{ payment.id.substring(0, 8) }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ financeService.formatCurrency(payment.amount) }}</div>
                  <div *ngIf="payment.status === 'overdue'" class="text-xs text-red-600">
                    +{{ getDaysOverdue(payment.dueDate) }} jours de retard
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [class]="getStatusClass(payment.status)" 
                        class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusLabel(payment.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <div [class]="getMethodIcon(payment.method)" class="p-1 rounded">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z"/>
                      </svg>
                    </div>
                    <span class="text-sm text-gray-900">{{ payment.method }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ financeService.formatDate(payment.dueDate) }}</div>
                  <div *ngIf="isOverdue(payment.dueDate)" class="text-xs text-red-600">
                    Échéance dépassée
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div *ngIf="payment.paidDate" class="text-sm text-gray-900">
                    {{ financeService.formatDate(payment.paidDate) }}
                  </div>
                  <div *ngIf="!payment.paidDate" class="text-sm text-gray-500">
                    Non payé
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <button 
                      (click)="viewPayment(payment)"
                      class="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50"
                      title="Voir les détails">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    
                    <button 
                      *ngIf="payment.status !== 'paid'"
                      (click)="markAsPaid(payment)"
                      class="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                      title="Marquer comme payé">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </button>

                    <button 
                      (click)="sendReminder(payment)"
                      class="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      title="Envoyer un rappel">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </button>

                    <button 
                      (click)="generateInvoice(payment)"
                      class="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50"
                      title="Générer une facture">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </button>

                    <button 
                      (click)="deletePayment(payment)"
                      class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Supprimer">
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

        <!-- Pagination -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Affichage de {{ startIndex + 1 }} à {{ endIndex }} sur {{ filteredPayments.length }} paiements
          </div>
          <div class="flex items-center space-x-2">
            <select 
              [(ngModel)]="pageSize" 
              (change)="changePage(1)"
              class="px-3 py-1 border border-gray-300 rounded text-sm">
              <option value="10">10 par page</option>
              <option value="25">25 par page</option>
              <option value="50">50 par page</option>
              <option value="100">100 par page</option>
            </select>
            
            <button 
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)"
              class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
              Précédent
            </button>
            
            <div class="flex items-center space-x-1">
              <button 
                *ngFor="let page of getVisiblePages()" 
                (click)="changePage(page)"
                [class]="page === currentPage ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'"
                class="px-3 py-1 border border-gray-300 rounded text-sm">
                {{ page }}
              </button>
            </div>
            
            <button 
              [disabled]="currentPage === totalPages"
              (click)="changePage(currentPage + 1)"
              class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaiementsHistoriqueComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  paginatedPayments: Payment[] = [];
  selectedPayments: string[] = [];

  // Filtres
  searchTerm = '';
  selectedStatus = '';
  selectedMethod = '';
  selectedPeriod = '';

  // Pagination
  currentPage = 1;
  pageSize = 25;
  totalPages = 1;

  // Tri
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Statistiques
  paidCount = 0;
  pendingCount = 0;
  overdueCount = 0;
  totalAmount = 0;

  constructor(
    public financeService: FinanceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  private loadPayments() {
    // En production, charger depuis le service
    const mockData = this.financeService.getMockFinancialData();
    this.payments = mockData.payments;
    this.applyFilters();
    this.updateStatistics();
  }

  applyFilters() {
    let filtered = [...this.payments];

    // Recherche textuelle
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.memberName.toLowerCase().includes(term) ||
        payment.spaceName.toLowerCase().includes(term) ||
        payment.memberLocation.toLowerCase().includes(term) ||
        payment.id?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (this.selectedStatus) {
      filtered = filtered.filter(payment => payment.status === this.selectedStatus);
    }

    // Filtre par méthode
    if (this.selectedMethod) {
      filtered = filtered.filter(payment => payment.method === this.selectedMethod);
    }

    // Filtre par période
    if (this.selectedPeriod) {
      const now = new Date();
      filtered = filtered.filter(payment => {
        const paymentDate = payment.paidDate || payment.dueDate;
        switch (this.selectedPeriod) {
          case 'today':
            return this.isSameDay(paymentDate, now);
          case 'week':
            return this.isWithinDays(paymentDate, 7);
          case 'month':
            return this.isWithinDays(paymentDate, 30);
          case 'quarter':
            return this.isWithinDays(paymentDate, 90);
          case 'year':
            return this.isWithinDays(paymentDate, 365);
          default:
            return true;
        }
      });
    }

    this.filteredPayments = filtered;
    this.currentPage = 1;
    this.updatePagination();
    this.updateStatistics();
  }

  private updatePagination() {
    this.totalPages = Math.ceil(this.filteredPayments.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedPayments = this.filteredPayments.slice(startIndex, endIndex);
  }

  private updateStatistics() {
    this.paidCount = this.filteredPayments.filter(p => p.status === 'paid').length;
    this.pendingCount = this.filteredPayments.filter(p => p.status === 'pending').length;
    this.overdueCount = this.filteredPayments.filter(p => p.status === 'overdue').length;
    this.totalAmount = this.filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredPayments.sort((a, b) => {
      let aValue: any = a[field as keyof Payment];
      let bValue: any = b[field as keyof Payment];

      if (aValue instanceof Date) aValue = aValue.getTime();
      if (bValue instanceof Date) bValue = bValue.getTime();

      // Gérer les valeurs nulles
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return this.sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return this.sortDirection === 'asc' ? -1 : 1;

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getVisiblePages(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredPayments.length);
  }

  selectAll() {
    if (this.selectedPayments.length === this.filteredPayments.length) {
      this.selectedPayments = [];
    } else {
      this.selectedPayments = this.filteredPayments.map(p => p.id!);
    }
  }

  togglePaymentSelection(paymentId: string) {
    const index = this.selectedPayments.indexOf(paymentId);
    if (index > -1) {
      this.selectedPayments.splice(index, 1);
    } else {
      this.selectedPayments.push(paymentId);
    }
  }

  bulkAction(action: string) {
    switch (action) {
      case 'reminder':
        this.sendBulkReminders();
        break;
      case 'delete':
        this.deleteBulkPayments();
        break;
    }
  }

  private sendBulkReminders() {
    console.log('Envoi de rappels pour les paiements:', this.selectedPayments);
    // Implémenter l'envoi de rappels
    this.selectedPayments = [];
  }

  private deleteBulkPayments() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedPayments.length} paiement(s) ?`)) {
      console.log('Suppression des paiements:', this.selectedPayments);
      // Implémenter la suppression
      this.selectedPayments = [];
      this.loadPayments();
    }
  }

  viewPayment(payment: Payment) {
    console.log('Voir le paiement:', payment);
    // Ouvrir un modal ou naviguer vers la page de détail
  }

  markAsPaid(payment: Payment) {
    console.log('Marquer comme payé:', payment);
    // Implémenter la mise à jour du statut
  }

  sendReminder(payment: Payment) {
    console.log('Envoyer un rappel pour:', payment);
    // Implémenter l'envoi de rappel
  }

  generateInvoice(payment: Payment) {
    console.log('Générer une facture pour:', payment);
    // Implémenter la génération de facture
  }

  deletePayment(payment: Payment) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le paiement de ${payment.memberName} ?`)) {
      console.log('Supprimer le paiement:', payment);
      // Implémenter la suppression
      this.loadPayments();
    }
  }

  exportPayments() {
    console.log('Export des paiements filtré');
    // Implémenter l'export
  }

  goBack() {
    this.router.navigate(['/dashboard/finances']);
  }

  // Utilitaires
  trackByPayment(index: number, payment: Payment): string {
    return payment.id || index.toString();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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
    return this.financeService.getPaymentMethodIcon(method);
  }

  getDaysOverdue(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private isWithinDays(date: Date, days: number): boolean {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }
}