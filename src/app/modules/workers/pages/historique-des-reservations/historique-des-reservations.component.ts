import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historique-des-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Historique des réservations</h1>
        <p class="text-gray-600">Consultez toutes vos réservations passées et à venir</p>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Réservations</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.reservations }}</p>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Terminées</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.terminees }}</p>
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
              <p class="text-sm text-gray-600">Total dépensé</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalDepense | number }} FCFA</p>
            </div>
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
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
                placeholder="Rechercher par espace, référence ou lieu..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
          </div>

          <!-- Filtres -->
          <div class="flex gap-2">
            <select 
              [(ngModel)]="statusFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Tous statuts</option>
              <option value="terminee">Terminée</option>
              <option value="confirmee">Confirmée</option>
              <option value="en-attente">En attente</option>
              <option value="annulee">Annulée</option>
            </select>

            <select 
              [(ngModel)]="typeFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Tous types</option>
              <option value="bureau">Bureau</option>
              <option value="salle-reunion">Salle de réunion</option>
              <option value="espace-travail">Espace de travail</option>
              <option value="equipement">Équipement</option>
            </select>

            <select 
              [(ngModel)]="periodFilter"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Toute période</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Liste des réservations -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900">Réservations ({{ getFilteredReservations().length }})</h3>
        </div>

        <div class="divide-y divide-gray-200">
          <div *ngFor="let reservation of getFilteredReservations()" 
               class="p-6 hover:bg-gray-50 transition-colors">
            
            <div class="flex items-start justify-between">
              <!-- Icône et détails -->
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                
                <div class="flex-1">
                  <div class="flex items-center gap-3">
                    <h4 class="font-medium text-gray-900">{{ reservation.spaceName }}</h4>
                    <span *ngIf="reservation.spaceType" 
                          class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {{ reservation.spaceType }}
                    </span>
                  </div>
                  
                  <p class="text-sm text-gray-600 mt-1">{{ reservation.location }}</p>
                  <p class="text-xs text-gray-500 mt-1">Réf: {{ reservation.reference }}</p>
                  
                  <!-- Détails de la réservation -->
                  <div class="flex items-center gap-6 mt-3 text-sm text-gray-600">
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span>{{ reservation.date }}</span>
                    </div>
                    
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>{{ reservation.timeRange }}</span>
                    </div>
                    
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span>{{ reservation.location }}</span>
                    </div>
                    
                    <div class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                      </svg>
                      <span>{{ reservation.participants }} pers.</span>
                    </div>
                  </div>

                  <!-- Évaluation (si disponible) -->
                  <div *ngIf="reservation.rating" class="flex items-center gap-2 mt-3">
                    <span class="text-sm text-gray-600">Votre évaluation:</span>
                    <div class="flex items-center gap-1">
                      <svg *ngFor="let star of getStarsArray(reservation.rating)" 
                           class="w-4 h-4 text-yellow-400 fill-current" 
                           viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span class="text-sm text-gray-600">({{ reservation.rating }}/5)</span>
                    </div>
                  </div>

                  <!-- Commentaire (si disponible) -->
                  <div *ngIf="reservation.comment" class="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-700 italic">"{{ reservation.comment }}"</p>
                  </div>

                  <!-- Notes ou commentaires -->
                  <div *ngIf="reservation.notes" class="mt-2">
                    <p class="text-sm text-gray-600"><strong>Notes:</strong> {{ reservation.notes }}</p>
                  </div>

                  <!-- Prix -->
                  <div class="mt-3">
                    <p class="text-lg font-bold text-gray-900">{{ reservation.price | number }} FCFA</p>
                  </div>
                </div>
              </div>

              <!-- Statut et actions -->
              <div class="flex flex-col items-end gap-3">
                <span 
                  [class]="getStatusClass(reservation.status)"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusLabel(reservation.status) }}
                </span>

                <!-- Actions selon le statut -->
                <div class="flex gap-2" *ngIf="reservation.status === 'confirmee'">
                  <button 
                    class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Confirmer
                  </button>
                </div>

                <!-- Menu d'actions -->
                <div class="relative">
                  <button class="p-1 text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div *ngIf="getFilteredReservations().length === 0" 
             class="p-12 text-center text-gray-500">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p class="font-medium text-gray-900 mb-1">Aucune réservation trouvée</p>
          <p>Aucune réservation ne correspond à vos critères de recherche.</p>
          <button 
            (click)="goToSpaces()"
            class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Découvrir les espaces
          </button>
        </div>
      </div>
    </div>
  `
})
export class HistoriqueDesReservationsComponent implements OnInit {
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  periodFilter = '';

  stats = {
    reservations: 5,
    terminees: 3,
    totalDepense: 220000
  };

  reservations = [
    {
      id: 1,
      spaceName: 'Bureau privé 101',
      spaceType: 'Bureau',
      location: 'Cocody, Abidjan',
      reference: 'EM001',
      date: '15 déc. 2024',
      timeRange: '09:00-17:00 (8h)',
      participants: 2,
      price: 120000,
      status: 'terminee',
      rating: 5.0,
      comment: 'Très bon espace, calme et bien équipé',
      notes: 'Excellente journée de travail'
    },
    {
      id: 2,
      spaceName: 'Salle de réunion Alpha',
      spaceType: 'Salle de réunion',
      location: 'Plateau, Abidjan',
      reference: 'EM002',
      date: '20 déc. 2024',
      timeRange: '14:00-16:00 (2h)',
      participants: 6,
      price: 50000,
      status: 'terminee',
      rating: 4.0,
      comment: 'Bonne salle mais un peu bruyante'
    },
    {
      id: 3,
      spaceName: 'Bureau privé 101',
      spaceType: 'Bureau',
      location: 'Cocody, Abidjan',
      reference: 'EM003',
      date: '16 janv. 2025',
      timeRange: '09:00-12:00 (3h)',
      participants: 1,
      price: 50000,
      status: 'confirmee'
    },
    {
      id: 4,
      spaceName: 'Espace coworking Beta',
      spaceType: 'Espace de travail',
      location: 'Marcory, Abidjan',
      reference: 'EM004',
      date: '22 janv. 2025',
      timeRange: '10:00-18:00 (8h)',
      participants: 3,
      price: 80000,
      status: 'en-attente'
    },
    {
      id: 5,
      spaceName: 'Projecteur HD Pro',
      spaceType: 'Équipement',
      location: 'Plateau, Abidjan',
      reference: 'EM005',
      date: '28 déc. 2024',
      timeRange: '14:00-17:00 (3h)',
      participants: 1,
      price: 25000,
      status: 'annulee'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.calculateStats();
  }

  calculateStats() {
    this.stats.reservations = this.reservations.length;
    this.stats.terminees = this.reservations.filter(r => r.status === 'terminee').length;
    this.stats.totalDepense = this.reservations
      .filter(r => r.status === 'terminee')
      .reduce((sum, r) => sum + r.price, 0);
  }

  getFilteredReservations() {
    return this.reservations.filter(reservation => {
      const matchesSearch = !this.searchTerm || 
        reservation.spaceName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reservation.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reservation.reference.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || reservation.status === this.statusFilter;
      const matchesType = !this.typeFilter || reservation.spaceType?.toLowerCase().includes(this.typeFilter);
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'terminee': return 'bg-green-100 text-green-700';
      case 'confirmee': return 'bg-blue-100 text-blue-700';
      case 'en-attente': return 'bg-orange-100 text-orange-700';
      case 'annulee': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'terminee': return 'Terminée';
      case 'confirmee': return 'Confirmée';
      case 'en-attente': return 'En attente';
      case 'annulee': return 'Annulée';
      default: return 'Inconnue';
    }
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  goToSpaces() {
    this.router.navigate(['/workers/espaces-disponibles']);
  }
}